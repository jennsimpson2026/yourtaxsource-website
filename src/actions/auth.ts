"use server";

import { db } from "@/lib/db";
import { users, auditLogs, verificationTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { authenticator } from "@/lib/otplib";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/notifications";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return { error: "User already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      role: "CLIENT", // Default role
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Failed to create account" };
  }
}

export async function setupPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  if (!email || !token || !password) {
    return { error: "All fields are required" };
  }

  // Validate the token from verification_tokens table
  const verificationToken = await db.query.verificationTokens.findFirst({
    where: (vt, { and, eq }) => and(eq(vt.identifier, email), eq(vt.token, token)),
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return { error: "Invalid or expired setup token" };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return { error: "User not found" };
  }

  if (user.password) {
    return { error: "Account already set up. Please use login." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.transaction(async (tx) => {
      await tx.update(users)
        .set({ password: hashedPassword, emailVerified: new Date() })
        .where(eq(users.id, user.id));

      await tx.delete(verificationTokens)
        .where(and(eq(verificationTokens.identifier, email), eq(verificationTokens.token, token)));

      await tx.insert(auditLogs).values({
        userId: user.id,
        action: "SETUP_PASSWORD",
        targetType: "USER",
        targetId: user.id,
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Setup password error:", error);
    return { error: "Failed to set up password" };
  }
}

export async function generateMfaSecret(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return { error: "User not found" };
  }

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.toURI({ label: user.email, issuer: "Your Tax Source", secret });

  await db.update(users).set({ mfaSecret: secret }).where(eq(users.id, userId));

  return { secret, otpauth };
}

export async function verifyAndEnableMfa(userId: string, token: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || !user.mfaSecret) {
    return { error: "MFA not set up" };
  }

  const isValid = authenticator.verify({ token, secret: user.mfaSecret });

  if (!isValid) {
    return { error: "Invalid code" };
  }

  await db.update(users).set({ mfaEnabled: true }).where(eq(users.id, userId));

  await db.insert(auditLogs).values({
    userId,
    action: "ENABLE_MFA",
    targetType: "USER",
    targetId: userId,
  });

  revalidatePath("/");
  return { success: true };
}

export async function forgotPassword(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    if (!email) return { error: "Email is required" };

    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    // Security best practice: don't reveal if user exists
    if (!user) return { success: true };

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await db.insert(verificationTokens).values({
      identifier: email.toLowerCase(),
      token,
      expires,
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
    console.log(`Sending reset link to ${email}: ${resetLink}`);

    await sendEmail({
      to: email,
      subject: "Reset your password - Your Tax Source",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`
    });

    return { success: true };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  if (!email || !token || !password) return { error: "All fields are required" };

  const verificationToken = await db.query.verificationTokens.findFirst({
    where: (vt, { and, eq }) => and(eq(vt.identifier, email.toLowerCase()), eq(vt.token, token)),
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return { error: "Invalid or expired reset token" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.transaction(async (tx) => {
      await tx.update(users).set({ password: hashedPassword }).where(eq(users.email, email.toLowerCase()));
      await tx.delete(verificationTokens).where(and(eq(verificationTokens.identifier, email.toLowerCase()), eq(verificationTokens.token, token)));
      
      const user = await tx.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
      if (user) {
        await tx.insert(auditLogs).values({
          userId: user.id,
          action: "RESET_PASSWORD",
          targetType: "USER",
          targetId: user.id,
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Failed to reset password" };
  }
}
