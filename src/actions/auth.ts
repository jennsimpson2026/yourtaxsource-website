"use server";

import { db } from "@/lib/db";
import { users, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authenticator } from "@/lib/otplib";
import { revalidatePath } from "next/cache";

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

  // Simple validation for the "AUTO_GEN" token we created in onboarding
  if (!token.startsWith("AUTO_GEN_")) {
    return { error: "Invalid or expired setup token" };
  }

  const userId = token.replace("AUTO_GEN_", "");

  const user = await db.query.users.findFirst({
    where: (u, { and, eq }) => and(eq(u.id, userId), eq(u.email, email)),
  });

  if (!user) {
    return { error: "User not found or email mismatch" };
  }

  if (user.password) {
    return { error: "Account already set up. Please use login." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));

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
