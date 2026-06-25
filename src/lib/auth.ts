import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { users, auditLogs } from "./db/schema";
import { eq, sql } from "drizzle-orm";
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
          console.log("Auth: Missing email or password");
          return null;
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();
        console.log(`Auth: Attempting login for ${normalizedEmail}`);
        
        // Debug DB connection
        console.log(`Auth: DB URL configured: ${process.env.DATABASE_URL?.substring(0, 15)}...`);

        try {
          const user = await db.query.users.findFirst({
            where: eq(users.email, normalizedEmail),
          });

          if (!user) {
            console.log(`Auth: User not found: ${normalizedEmail}`);
            // Check if ANY users exist to verify DB connectivity
            const userCount = await db.select({ count: sql`count(*)` }).from(users);
            console.log(`Auth: Total users in DB: ${JSON.stringify(userCount)}`);
            return null;
          }

          if (!user.password) {
            console.log(`Auth: User has no password set: ${normalizedEmail}`);
            return null;
          }

          console.log(`Auth: Found user, comparing password...`);
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log(`Auth: Invalid password for ${normalizedEmail}`);
            return null;
          }

          console.log(`Auth: Login successful for ${normalizedEmail}, role: ${user.role}`);

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
              // Check backup codes if 8 chars (hex)
              if (credentials.code.length === 8 && user.mfaBackupCodes) {
                const backupCodes = JSON.parse(user.mfaBackupCodes) as string[];
                let foundIndex = -1;
                
                for (let i = 0; i < backupCodes.length; i++) {
                  const isMatch = await bcrypt.compare(credentials.code, backupCodes[i]);
                  if (isMatch) {
                    foundIndex = i;
                    break;
                  }
                }

                if (foundIndex !== -1) {
                  // Use backup code: remove it from the list
                  const remainingCodes = backupCodes.filter((_, i) => i !== foundIndex);
                  await db.update(users)
                    .set({ mfaBackupCodes: JSON.stringify(remainingCodes) })
                    .where(eq(users.id, user.id));
                  
                  console.log(`Auth: Used backup code for ${normalizedEmail}`);
                } else {
                  throw new Error("INVALID_MFA_CODE");
                }
              } else {
                throw new Error("INVALID_MFA_CODE");
              }
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
          console.error("Auth: Database error during authorize:", dbError);
          // Log specific Turso/LibSQL errors if possible
          if (dbError.message) {
             console.error("Auth: Error message:", dbError.message);
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
          console.error("Error fetching user role in JWT callback:", e);
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

        await db.insert(auditLogs).values({
          userId: user.id,
          action: "SIGN_IN",
          targetType: "USER",
          targetId: user.id,
        });
      } catch (e) {
        console.error("Error in signIn event:", e);
      }
    },
    async signOut({ token }) {
      if (token?.id) {
        try {
          await db.insert(auditLogs).values({
            userId: token.id as string,
            action: "SIGN_OUT",
            targetType: "USER",
            targetId: token.id as string,
          });
        } catch (e) {
          console.error("Error in signOut event:", e);
        }
      }
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};

export const auth = () => getServerSession(authOptions);
