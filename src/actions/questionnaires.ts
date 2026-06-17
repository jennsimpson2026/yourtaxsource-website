"use server";

import { db } from "@/lib/db";
import { questionnaires, auditLogs, taxReturns } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function saveQuestionnaire(returnId: string, data: any, isSubmitted: boolean = false) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

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
