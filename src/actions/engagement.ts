"use server";

import { db } from "@/lib/db";
import { engagementLetters, auditLogs, users, workflows, taxReturns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { generateEngagementLetterPDF } from "@/lib/pdf-server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME, getPresignedUrl } from "@/lib/s3";
import { workflowClient } from "@/lib/workflow";
import { DEFAULT_ENGAGEMENT_LETTER_CONTENT } from "@/lib/onboarding";

export async function signEngagementLetter(
  letterId: string, 
  signatureData: string,
  consentAgreed: boolean = true,
  consentElectronic: boolean = true,
  consentResponsibility: boolean = true
) {
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
    
    // Check if Upstash is configured. If not, perform signing synchronously.
    const isUpstashConfigured = !!process.env.QSTASH_TOKEN;

    if (!isUpstashConfigured) {
      console.log(`[SIGN_ENGAGEMENT] Upstash not configured for letter ${letterId}, performing synchronous signing...`);
      
      try {
        // 1. Generate PDF
        console.log("[SIGN_ENGAGEMENT] Generating PDF...");
        const pdfBuffer = await generateEngagementLetterPDF({
          clientName: (letter.taxReturn as any).client.name || "Valued Client",
          signedAt,
          signatureData,
          content: letter.content,
          year: (letter.taxReturn as any).year,
        });
        console.log(`[SIGN_ENGAGEMENT] PDF generated, size: ${pdfBuffer.length} bytes`);

        // 2. Upload to S3
        const s3Key = `engagement-letters/${letterId}-signed.pdf`;
        console.log(`[SIGN_ENGAGEMENT] Uploading to S3: ${BUCKET_NAME}/${s3Key}`);
        await s3Client.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
          Body: pdfBuffer,
          ContentType: 'application/pdf',
        }));
        console.log("[SIGN_ENGAGEMENT] S3 upload successful");

        // 3. Update database
        console.log("[SIGN_ENGAGEMENT] Updating database...");
        await db.update(engagementLetters)
          .set({
            status: "SIGNED",
            signatureData,
            signedAt,
            s3Key,
            consentAgreed,
            consentElectronic,
            consentResponsibility,
            updatedAt: new Date(),
          })
          .where(eq(engagementLetters.id, letterId));
        console.log("[SIGN_ENGAGEMENT] Database update successful");

        await db.insert(auditLogs).values({
          userId,
          action: "SIGN_ENGAGEMENT_LETTER_COMPLETE_SYNC",
          targetType: "ENGAGEMENT_LETTER",
          targetId: letterId,
        });

        revalidatePath("/portal/resources");
        return { success: true, message: "Letter signed successfully." };
      } catch (innerError) {
        console.error("[SIGN_ENGAGEMENT] Inner failure during synchronous signing:", innerError);
        throw innerError;
      }
    }

    // --- Original Workflow Path ---
    
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
        consentAgreed,
        consentElectronic,
        consentResponsibility,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Update workflow entry with real Upstash ID if needed
    await db.update(workflows)
      .set({ id: workflowRunId })
      .where(eq(workflows.id, workflowId));

    // Update letter status to "PROCESSING"
    await db.update(engagementLetters)
      .set({
        status: "PROCESSING",
        signatureData,
        consentAgreed,
        consentElectronic,
        consentResponsibility,
        updatedAt: new Date(),
      })
      .where(eq(engagementLetters.id, letterId));

    revalidatePath("/portal/resources");
    return { success: true, message: "Processing signature..." };
  } catch (error) {
    console.error("Sign engagement letter error:", error);
    return { error: "Failed to sign engagement letter. Please contact support if this persists." };
  }
}

export async function createEngagementLetter(returnId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const taxReturn = await db.query.taxReturns.findFirst({
    where: eq(taxReturns.id, returnId),
  });

  if (!taxReturn) throw new Error("Return not found");

  // Check permission: Staff/Admin OR Client who owns the return
  const isStaff = ["STAFF", "ADMIN"].includes((session.user as any).role);
  const isOwner = taxReturn.clientId === (session.user as any).id;

  if (!isStaff && !isOwner) {
    throw new Error("Unauthorized: You do not have permission to create this letter");
  }

  // Check if one already exists to avoid duplicates
  const existing = await db.query.engagementLetters.findFirst({
    where: eq(engagementLetters.returnId, returnId),
  });

  if (existing) return existing;

  const [letter] = await db.insert(engagementLetters).values({
    returnId,
    content: DEFAULT_ENGAGEMENT_LETTER_CONTENT,
    status: "PENDING",
  }).returning();

  revalidatePath(`/admin/returns/${returnId}`);
  revalidatePath("/portal/resources");
  return letter;
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
