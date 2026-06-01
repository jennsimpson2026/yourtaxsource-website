"use server";

import { db } from "@/lib/db";
import { users, auditLogs } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function updateUserRole(userId: string, newRole: string) {
  const session = await getServerSession(authOptions);
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
