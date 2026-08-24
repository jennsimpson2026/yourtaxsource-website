import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { users, auditLogs } from "./db/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authenticator } from "./otplib";
import { loginLimiter } from "./ratelimit";
import { headers } from "next/headers";
import { logger } from "./logger";
import { logAction } from "./audit";

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
          logger.info("Auth: Missing email or password");
          return null;
        }

        // Rate limiting
        const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
        const { success } = await loginLimiter.limit(ip);
        if (!success) {
          logger.warn("Login rate limit exceeded", { ip });
          throw new Error("TOO_MANY_REQUESTS");
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();
        logger.info("Login attempt", { email: normalizedEmail, ip });
        logger.info(`Auth: Attempting login for ${normalizedEmail}`);
        
        // Debug DB connection
        logger.info(`Auth: DB URL configured: ${process.env.DATABASE_URL?.substring(0, 15)}...`);

        try {
          const user = await db.query.users.findFirst({
            where: eq(users.email, normalizedEmail),
          });

          if (!user) {
            logger.info(`Auth: User not found: ${normalizedEmail}`);
            // Check if ANY users exist to verify DB connectivity
            const userCount = await db.select({ count: sql`count(*)` }).from(users);
            logger.info(`Auth: Total users in DB: ${JSON.stringify(userCount)}`);
            return null;
          }

          if (!user.password) {
            logger.info(`Auth: User has no password set: ${normalizedEmail}`);
            return null;
          }

          logger.info(`Auth: Found user, comparing password...`);
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            logger.warn("Invalid password", { email: normalizedEmail, ip });
            logger.info(`Auth: Invalid password for ${normalizedEmail}`);
            return null;
          }

          logger.info(`Auth: Login successful for ${normalizedEmail}, role: ${user.role}`);

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
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            mfaEnabled: user.mfaEnabled || false,
          };
        } catch (dbError: any) {
          logger.error("Auth: Database error during authorize:", dbError);
          // Log specific Turso/LibSQL errors if possible
          if (dbError.message) {
             logger.error("Auth: Error message:", dbError.message);
          }
          return null;
        }
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
          logger.error("Error fetching user role in JWT callback:", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
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
      try {
        await db.update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, user.id));

        await logAction({
          userId: user.id,
          action: "SIGN_IN",
          targetType: "USER",
          targetId: user.id,
        });
      } catch (e) {
        logger.error("Error in signIn event:", e);
      }
    },
    async signOut({ token }) {
      if (token?.id) {
        try {
          await logAction({
            userId: token.id as string,
            action: "SIGN_OUT",
            targetType: "USER",
            targetId: token.id as string,
          });
        } catch (e) {
          logger.error("Error in signOut event:", e);
        }
      }
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};

export const auth = () => getServerSession(authOptions);
