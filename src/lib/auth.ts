import { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { users, auditLogs } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authenticator } from "./otplib";

export const authOptions: NextAuthOptions = {
  // @ts-ignore
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "MFA Code", type: "text", optional: true },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();

        const user = await db.query.users.findFirst({
          where: eq(users.email, normalizedEmail),
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Check MFA if enabled
        if (user.mfaEnabled) {
          if (!credentials.code) {
            throw new Error("MFA_REQUIRED");
          }

          if (!user.mfaSecret) {
            throw new Error("MFA_SECRET_MISSING");
          }

          const isValidCode = authenticator.verify({
            token: credentials.code,
            secret: user.mfaSecret,
          });

          if (!isValidCode) {
            throw new Error("INVALID_MFA_CODE");
          }
        } else if (user.role === "ADMIN" || user.role === "STAFF") {
            // Force MFA setup for staff/admin if not enabled
            // This is a business requirement. We might handle this by redirecting to an MFA setup page if the session indicates it's missing.
            // For now, let's just log them in but we should enforce this in the UI/Middleware.
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mfaEnabled: user.mfaEnabled || false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
        // @ts-ignore
        token.mfaEnabled = user.mfaEnabled;
      } else if (token.id && !token.role) {
        // Fallback: Fetch role from DB if missing from token
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.id, token.id as string),
          });
          if (dbUser) {
            // @ts-ignore
            token.role = dbUser.role;
          }
        } catch (e) {
          console.error("Error fetching user role in JWT callback:", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        console.log("Session callback - token object:", JSON.stringify(token));
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role;
        // @ts-ignore
        session.user.mfaEnabled = token.mfaEnabled;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Update lastLoginAt
      await db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      await db.insert(auditLogs).values({
        userId: user.id,
        action: "SIGN_IN",
        targetType: "USER",
        targetId: user.id,
      });
    },
    async signOut({ token }) {
      if (token?.id) {
        await db.insert(auditLogs).values({
          userId: token.id as string,
          action: "SIGN_OUT",
          targetType: "USER",
          targetId: token.id as string,
        });
      }
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};

export const auth = () => getServerSession(authOptions);
