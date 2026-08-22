"use server";

import { db } from "@/lib/db";
import { users, auditLogs } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function updateUserRole(userId: string, newRole: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (!["CLIENT", "STAFF", "ADMIN"].includes(newRole)) {
    throw new Error("Invalid role");
  }

  await db.update(users)
    .set({ role: newRole as any })
    .where(eq(users.id, userId));

  await db.insert(auditLogs).values({
    userId: (session.user as any).id,
    action: "UPDATE_USER_ROLE",
    targetType: "USER",
    targetId: userId,
    metadata: JSON.stringify({ newRole }),
  });

  revalidatePath("/admin/users");
}

export async function updateProfile(data: { name?: string; image?: string }) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as any).id;

  await db.update(users)
    .set({ 
      name: data.name,
      image: data.image,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));

  await db.insert(auditLogs).values({
    userId,
    action: "UPDATE_PROFILE",
    targetType: "USER",
    targetId: userId,
    metadata: JSON.stringify(data),
  });

  revalidatePath("/admin/profile");
  revalidatePath("/blog"); // Revalidate blog pages as author info might have changed
}
