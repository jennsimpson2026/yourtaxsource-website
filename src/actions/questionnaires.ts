"use server";

import { db } from "@/lib/db";
import { questionnaires, auditLogs, taxReturns } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { saveLimiter } from "@/lib/ratelimit";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";

export async function saveQuestionnaire(returnId: string, data: any, isSubmitted: boolean = false) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  // Rate limiting
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await saveLimiter.limit(userId); // Per-user limit
  if (!success) {
    logger.warn("Questionnaire save rate limit exceeded", { userId, returnId, ip });
    return { error: "Too many saves. Please wait a moment." };
  }

  // Check if questionnaire already exists for this return
  const existing = await db.query.questionnaires.findFirst({
    where: and(
      eq(questionnaires.returnId, returnId),
      eq(questionnaires.clientId, userId)
    ),
  });

  let result;
  if (existing) {
    [result] = await db.update(questionnaires)
      .set({
        data: JSON.stringify(data),
        isSubmitted,
        submittedAt: isSubmitted ? new Date() : null,
      })
      .where(eq(questionnaires.id, existing.id))
      .returning();
  } else {
    [result] = await db.insert(questionnaires).values({
      clientId: userId,
      returnId,
      data: JSON.stringify(data),
      isSubmitted,
      submittedAt: isSubmitted ? new Date() : null,
    }).returning();
  }

  await db.insert(auditLogs).values({
    userId,
    action: isSubmitted ? "SUBMIT_QUESTIONNAIRE" : "SAVE_QUESTIONNAIRE_DRAFT",
    targetType: "QUESTIONNAIRE",
    targetId: result.id,
  });

  revalidatePath("/portal/questionnaire");
  return result;
}

export async function getQuestionnaire(returnId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id;
  
  return db.query.questionnaires.findFirst({
    where: and(
      eq(questionnaires.returnId, returnId),
      eq(questionnaires.clientId, userId)
    ),
  });
}
