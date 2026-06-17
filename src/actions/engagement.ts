"use server";

import { db } from "@/lib/db";
import { engagementLetters, auditLogs, users, workflows } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

import { generateEngagementLetterPDF } from "@/lib/pdf-server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME, getPresignedUrl } from "@/lib/s3";
import { workflowClient } from "@/lib/workflow";

export async function signEngagementLetter(letterId: string, signatureData: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const userId = (session.user as any).id;

  const letter = await db.query.engagementLetters.findFirst({
    where: eq(engagementLetters.id, letterId),
    with: {
      taxReturn: {
        with: {
          client: true,
        }
      },
    }
  });

  if (!letter || (letter.taxReturn as any).clientId !== userId) {
    return { error: "Letter not found" };
  }

  if (letter.status === "SIGNED") {
    return { error: "Letter already signed" };
  }

  try {
    const signedAt = new Date();
    
    // Track workflow in our DB
    const workflowId = `wf_el_${letterId}_${Date.now()}`;
    await db.insert(workflows).values({
      id: workflowId,
      name: "Engagement Letter Signing",
      status: "running",
      data: JSON.stringify({ letterId, userId }),
    });

    // Trigger Upstash Workflow
    const { workflowRunId } = await workflowClient.trigger({
      url: `${process.env.NEXTAUTH_URL}/api/workflow/engagement-letter`,
      body: {
        letterId,
        signatureData,
        clientName: (letter.taxReturn as any).client.name || "Valued Client",
        content: letter.content,
        year: (letter.taxReturn as any).year,
        userId,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Update workflow entry with real Upstash ID if needed, 
    // or just use the one we created.
    // Actually, trigger() returns workflowRunId.
    await db.update(workflows)
      .set({ id: workflowRunId })
      .where(eq(workflows.id, workflowId));

    // Update letter status to "PROCESSING" or similar?
    // The requirement says "SIGNED", but since it's background, 
    // maybe "PROCESSING" is better until the workflow finishes.
    await db.update(engagementLetters)
      .set({
        status: "PROCESSING",
        signatureData,
        updatedAt: new Date(),
      })
      .where(eq(engagementLetters.id, letterId));

    return { success: true, message: "Processing signature..." };
  } catch (error) {
    console.error("Sign engagement letter error:", error);
    return { error: "Failed to sign engagement letter" };
  }
}

export async function getEngagementLetterDownloadUrl(letterId: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const userId = (session.user as any).id;

  const letter = await db.query.engagementLetters.findFirst({
    where: eq(engagementLetters.id, letterId),
    with: {
      taxReturn: true,
    }
  });

  if (!letter || (letter.taxReturn as any).clientId !== userId) {
    return { error: "Letter not found" };
  }

  if (!letter.s3Key) {
    return { error: "Letter not yet generated" };
  }

  try {
    const url = await getPresignedUrl(letter.s3Key);
    return { url };
  } catch (error) {
    console.error("Get engagement letter URL error:", error);
    return { error: "Failed to generate download link" };
  }
}


