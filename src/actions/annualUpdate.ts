"use server";

import { db } from "@/lib/db";
import { annualUpdates, documents, auditLogs, taxReturns } from "@/lib/db/schema";
import { encrypt } from "@/lib/crypto";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { AnnualUpdatePDF } from "@/components/portal/AnnualUpdatePDF";

export async function submitAnnualUpdate(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id;
  const currentYear = new Date().getFullYear();

  try {
    // 1. Find or create the tax return record for this year
    let taxReturn = await db.query.taxReturns.findFirst({
      where: and(eq(taxReturns.clientId, userId), eq(taxReturns.year, currentYear)),
    });

    if (!taxReturn) {
      const [newReturn] = await db.insert(taxReturns).values({
        clientId: userId,
        year: currentYear,
        status: "IN_PROGRESS",
      }).returning();
      taxReturn = newReturn;
    }

    // 2. Encrypt sensitive fields (Banking Info)
    const bankingInfoData = {
      bankName: data.bankName,
      routingNumber: data.routingNumber,
      accountNumber: data.accountNumber,
      accountType: data.accountType,
    };
    const encryptedBankingInfo = encrypt(JSON.stringify(bankingInfoData));

    // 3. Prepare other data
    const taxInfo = JSON.stringify({
      firstName: data.firstName,
      lastName: data.lastName,
      ssnLast4: data.ssnLast4,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      phone: data.phone,
      email: data.email,
      filingStatus: data.filingStatus,
      boughtSoldHome: data.boughtSoldHome,
      startedBusiness: data.startedBusiness,
      receivedCrypto: data.receivedCrypto,
      foreignAccounts: data.foreignAccounts,
      signature: data.signature,
      date: data.date,
    });

    const dependents = JSON.stringify(data.dependents || []);

    // 4. Save to annual_updates table
    const existingUpdate = await db.query.annualUpdates.findFirst({
      where: and(eq(annualUpdates.clientId, userId), eq(annualUpdates.returnId, taxReturn.id)),
    });

    let updateId;
    if (existingUpdate) {
      await db.update(annualUpdates)
        .set({
          status: "SUBMITTED",
          taxInfo,
          dependents,
          bankingInfo: encryptedBankingInfo,
          priorYearChanges: data.majorLifeChanges,
          updatedAt: new Date(),
        })
        .where(eq(annualUpdates.id, existingUpdate.id));
      updateId = existingUpdate.id;
    } else {
      const [newUpdate] = await db.insert(annualUpdates).values({
        clientId: userId,
        returnId: taxReturn.id,
        status: "SUBMITTED",
        taxInfo,
        dependents,
        bankingInfo: encryptedBankingInfo,
        priorYearChanges: data.majorLifeChanges,
      }).returning();
      updateId = newUpdate.id;
    }

    // 5. Generate PDF Summary
    const buffer = await renderToBuffer(
      React.createElement(AnnualUpdatePDF, { data, taxYear: currentYear }) as any
    );

    // 6. Upload PDF to S3
    // Hierarchy: [TaxYear] / [LastName]_[FirstInitial] / Admin_Only / [FileName]
    const firstInitial = (data.firstName || "X").charAt(0).toUpperCase();
    const lastName = (data.lastName || "Unknown").replace(/[^a-zA-Z0-9]/g, '');
    const timestamp = new Date().getTime();
    const fileName = `Annual_Update_Summary_${lastName}_${firstInitial}_${timestamp}.pdf`;
    const s3Key = `${currentYear}/${lastName}_${firstInitial}/Admin_Only/${fileName}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: "application/pdf",
    }));

    // 7. Register document in DB (Admin Only)
    await db.insert(documents).values({
      userId,
      returnId: taxReturn.id,
      s3Key,
      fileName,
      fileType: "application/pdf",
      fileSize: buffer.length,
      category: "ADMIN_ONLY",
      taxYear: currentYear,
    });

    // 8. Audit Log
    await db.insert(auditLogs).values({
      userId,
      action: "SUBMIT_ANNUAL_UPDATE",
      targetType: "ANNUAL_UPDATE",
      targetId: updateId,
      metadata: JSON.stringify({ fileName, s3Key }),
    });

    // 9. Notify Admin (Jenn) via Email
    try {
      const { sendEmail } = await import("@/lib/notifications");
      await sendEmail({
        to: process.env.ADMIN_EMAIL || "jsimpson@yourtaxsource.com",
        subject: `[Annual Update] ${data.firstName} ${data.lastName} - 2024`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #6d28d9;">New Annual Update Submitted</h2>
            <p><strong>Client:</strong> ${data.firstName} ${data.lastName}</p>
            <p><strong>Tax Year:</strong> ${currentYear}</p>
            <p><strong>Filing Status:</strong> ${data.filingStatus}</p>
            <p>A summary PDF has been generated and saved to the client's documents under "Admin Only".</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/admin/returns/${taxReturn.id}" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Return</a>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
    }

    revalidatePath("/portal");
    revalidatePath(`/admin/returns/${taxReturn.id}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error submitting annual update:", error);
    throw new Error("Failed to submit annual update. Please try again.");
  }
}
