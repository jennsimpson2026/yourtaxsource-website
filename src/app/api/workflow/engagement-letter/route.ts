import { serve } from "@upstash/workflow/nextjs";
import { db } from "@/lib/db";
import { engagementLetters, auditLogs, workflows } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateEngagementLetterPDF } from "@/lib/pdf-server";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const { POST } = serve<{
  letterId: string;
  signatureData: string;
  clientName: string;
  content: string;
  year: number;
  userId: string;
  consentAgreed?: boolean;
  consentElectronic?: boolean;
  consentResponsibility?: boolean;
}>(async (context) => {
  const { 
    letterId, 
    signatureData, 
    clientName, 
    content, 
    year, 
    userId,
    consentAgreed,
    consentElectronic,
    consentResponsibility 
  } = context.requestPayload;

  try {
    // Step 1: Generate PDF
    const pdfBuffer = await context.run("generate-pdf", async () => {
      const buffer = await generateEngagementLetterPDF({
        clientName,
        signedAt: new Date(),
        signatureData,
        content,
        year,
      });
      // Upstash Workflow requires serializable data if returned from run
      // But we can use it within the same run or convert to base64
      return buffer.toString("base64");
    });

    // Step 2: Upload to S3
    const s3Key = `engagement-letters/${letterId}-signed.pdf`;
    await context.run("upload-to-s3", async () => {
      if (!process.env.AWS_S3_BUCKET) {
        console.warn("AWS_S3_BUCKET not set, skipping S3 upload");
        return;
      }
      
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: Buffer.from(pdfBuffer, "base64"),
        ContentType: 'application/pdf',
      }));
    });

    // Step 3: Update DB
    await context.run("update-db", async () => {
      // Update letter status to SIGNED
      await db.update(engagementLetters)
        .set({
          status: "SIGNED",
          signatureData,
          signedAt: new Date(),
          s3Key,
          consentAgreed,
          consentElectronic,
          consentResponsibility,
          updatedAt: new Date(),
        })
        .where(eq(engagementLetters.id, letterId));

      // Update tax return status to AWAITING_PAYMENT if it was READY_FOR_SIGNATURE
      const el = await db.query.engagementLetters.findFirst({
        where: eq(engagementLetters.id, letterId),
        with: {
          taxReturn: {
            with: {
              invoices: true
            }
          }
        }
      });

      if (el?.taxReturn && el.taxReturn.status === "READY_FOR_SIGNATURE") {
        const totalPaid = el.taxReturn.invoices
          .filter(inv => inv.status === "PAID")
          .reduce((sum, inv) => sum + Number(inv.amount), 0);
        const isFullyPaid = totalPaid >= Number(el.taxReturn.taxPrepFee || 0);

        const nextStatus = isFullyPaid ? "READY_TO_FILE" : "AWAITING_PAYMENT";
        
        console.log(`[SIGN_ENGAGEMENT_WF] Transitioning return ${el.taxReturn.id} to ${nextStatus} (Paid: ${totalPaid}/${el.taxReturn.taxPrepFee})`);
        
        await db.update(taxReturns)
          .set({ 
            status: nextStatus as any,
            paymentStatus: isFullyPaid ? "PAID" : el.taxReturn.paymentStatus,
            updatedAt: new Date() 
          })
          .where(eq(taxReturns.id, el.taxReturn.id));
      }

      await db.insert(auditLogs).values({
        userId,
        action: "SIGN_ENGAGEMENT_LETTER_COMPLETE",
        targetType: "ENGAGEMENT_LETTER",
        targetId: letterId,
      });

      // Update workflow status in our tracking table
      await db.update(workflows)
        .set({
          status: "successful",
          updatedAt: new Date(),
        })
        .where(eq(workflows.id, context.workflowRunId));
    });
  } catch (error: any) {
    console.error(`Workflow failure for letter ${letterId}:`, error);
    
    // Update workflow status in our tracking table
    await db.update(workflows)
      .set({
        status: "failed",
        error: error.message,
        updatedAt: new Date(),
      })
      .where(eq(workflows.id, context.workflowRunId));
      
    throw error; // Re-throw for Upstash to handle retries if configured
  }
});
