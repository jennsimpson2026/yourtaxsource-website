"use server";

import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { engagementLetters, auditLogs, users, workflows, taxReturns, invoices } from "@/lib/db/schema";
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
      logger.info(`[SIGN_ENGAGEMENT] Upstash not configured for letter ${letterId}, performing synchronous signing...`);
      
      try {
        // 1. Generate PDF
        logger.info("[SIGN_ENGAGEMENT] Generating PDF...");
        const pdfBuffer = await generateEngagementLetterPDF({
          clientName: (letter.taxReturn as any).client.name || "Valued Client",
          signedAt,
          signatureData,
          content: letter.content,
          year: (letter.taxReturn as any).year,
        });
        logger.info(`[SIGN_ENGAGEMENT] PDF generated, size: ${pdfBuffer.length} bytes`);

        // 2. Upload to S3
        const s3Key = `engagement-letters/${letterId}-signed.pdf`;
        logger.info(`[SIGN_ENGAGEMENT] Uploading to S3: ${BUCKET_NAME}/${s3Key}`);
        await s3Client.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
          Body: pdfBuffer,
          ContentType: 'application/pdf',
        }));
        logger.info("[SIGN_ENGAGEMENT] S3 upload successful");

        // 3. Update database
        logger.info("[SIGN_ENGAGEMENT] Updating database...");
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

        // Update tax return status if needed
        if (letter.taxReturn.status === "READY_FOR_SIGNATURE") {
          const allInvoices = await db.query.invoices.findMany({
            where: eq(invoices.returnId, (letter.taxReturn as any).id),
          });
          const totalPaid = allInvoices
            .filter(inv => inv.status === "PAID")
            .reduce((sum, inv) => sum + Number(inv.amount), 0);
          const isFullyPaid = totalPaid >= Number(letter.taxReturn.taxPrepFee || 0);

          const nextStatus = isFullyPaid ? "READY_TO_FILE" : "AWAITING_PAYMENT";
          
          await db.update(taxReturns)
            .set({ 
              status: nextStatus as any,
              paymentStatus: isFullyPaid ? "PAID" : letter.taxReturn.paymentStatus,
              updatedAt: new Date() 
            })
            .where(eq(taxReturns.id, (letter.taxReturn as any).id));
        }

        logger.info("[SIGN_ENGAGEMENT] Database update successful");

        await db.insert(auditLogs).values({
          userId,
          action: "SIGN_ENGAGEMENT_LETTER_COMPLETE_SYNC",
          targetType: "ENGAGEMENT_LETTER",
          targetId: letterId,
          status: "COMPLETED",
        });

        revalidatePath("/portal/resources");
        return { success: true, message: "Letter signed successfully." };
      } catch (innerError) {
        logger.error("[SIGN_ENGAGEMENT] Inner failure during synchronous signing:", innerError);
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
  } catch (error: any) {
    logger.error("[SIGN_ENGAGEMENT] Critical failure:", error);
    return { 
      error: `Failed to sign engagement letter: ${error.message || 'Unknown error'}. [${error.code || 'NO_CODE'}]` 
    };
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
    where: eq(engagementLetters.id, returnId),
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
  const userRole = (session.user as any).role;

  const letter = await db.query.engagementLetters.findFirst({
    where: eq(engagementLetters.id, letterId),
    with: {
      taxReturn: true,
    }
  });

  if (!letter) {
    return { error: "Letter not found" };
  }

  const isOwner = (letter.taxReturn as any).clientId === userId;
  const isStaff = userRole === "ADMIN" || userRole === "STAFF";

  if (!isOwner && !isStaff) {
    return { error: "Unauthorized" };
  }

  if (!letter.s3Key) {
    return { error: "Letter not yet generated" };
  }

  try {
    const url = await getPresignedUrl(letter.s3Key);
    return { url };
  } catch (error) {
    logger.error("Get engagement letter URL error:", error);
    return { error: "Failed to generate download link" };
  }
}
