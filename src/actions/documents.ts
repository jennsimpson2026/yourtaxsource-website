"use server";

import { db } from "@/lib/db";
import { documents, auditLogs, users, taxReturns } from "@/lib/db/schema";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and, isNotNull, lt, sql, desc, not } from "drizzle-orm";
import { notifyDocumentRequest, notifyDocumentUpload, notifyDocumentStatusUpdate } from "@/lib/notifications";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function softDeleteDocument(documentId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
  });

  if (!doc) throw new Error("Document not found");

  const isOwner = doc.userId === (session.user as any).id;
  const isAdmin = (session.user as any).role === "ADMIN";

  if (!isOwner && !isAdmin) throw new Error("Forbidden");

  await db.update(documents)
    .set({ deletedAt: new Date() })
    .where(eq(documents.id, documentId));

  await db.insert(auditLogs).values({
    userId: (session.user as any).id,
    action: "SOFT_DELETE_DOCUMENT",
    targetType: "DOCUMENT",
    targetId: documentId,
  });

  revalidatePath("/portal/documents");
  revalidatePath("/admin/returns");
  if (doc.returnId) {
    revalidatePath(`/admin/returns/${doc.returnId}`);
  }
}

export async function permanentlyDeleteOldDocuments() {
  // This would typically be called by a cron job
  // Permanent delete after 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const oldDocs = await db.query.documents.findMany({
    where: and(
      isNotNull(documents.deletedAt),
      lt(documents.deletedAt, thirtyDaysAgo)
    ),
  });

  for (const doc of oldDocs) {
    try {
      // 1. Delete from S3
      await s3Client.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: doc.s3Key,
      }));

      // 2. Delete from DB
      await db.delete(documents).where(eq(documents.id, doc.id));

      console.log(`Permanently deleted document: ${doc.fileName} (${doc.id})`);
    } catch (error) {
      console.error(`Failed to permanently delete document ${doc.id}:`, error);
    }
  }

  return oldDocs.length;
}

export async function requestDocument(userId: string, documentName: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role === "CLIENT") throw new Error("Unauthorized");

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      profile: true,
    },
  });

  if (!user) throw new Error("User not found");

  await notifyDocumentRequest(user.email, user.profile?.phone || null, documentName);

  await db.insert(auditLogs).values({
    userId: (session.user as any).id,
    action: "REQUEST_DOCUMENT",
    targetType: "USER",
    targetId: userId,
    metadata: JSON.stringify({ documentName }),
  });
}

export async function getUploadUrl(fileName: string, fileType: string, category: string, returnId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) throw new Error("User not found");

  let taxYear = new Date().getFullYear();
  if (returnId) {
    const taxReturn = await db.query.taxReturns.findFirst({
      where: eq(taxReturns.id, returnId),
    });
    if (taxReturn) {
      taxYear = taxReturn.year;
    }
  }

  // Parse name into [LastName]_[FirstInitial]
  const nameParts = (user.name || "User").trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : firstName;
  const firstInitial = firstName.charAt(0).toUpperCase();
  const humanReadableName = `${lastName}_${firstInitial}`;

  // Hierarchy: [TaxYear] / [LastName]_[FirstInitial] / [Category] / [FileName]
  const s3Key = `${taxYear}/${humanReadableName}/${category}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return { uploadUrl, s3Key, taxYear };
}

export async function registerDocument(data: {
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Key: string;
  category: string;
  taxYear?: number;
  returnId?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  console.log(`registerDocument: Registering file ${data.fileName} for userId ${userId}, returnId ${data.returnId}`);

  try {
    const [doc] = await db.insert(documents).values({
      userId,
      returnId: data.returnId,
      s3Key: data.s3Key,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      category: data.category,
      taxYear: data.taxYear || new Date().getFullYear(),
      // Default isLocked to true if it's a Final Return or provided by Staff
      isLocked: data.category === "Final Returns" || (session.user as any).role !== "CLIENT",
    }).returning();

    console.log(`registerDocument: Created record with ID ${doc.id}`);

    await db.insert(auditLogs).values({
      userId,
      action: "UPLOAD_DOCUMENT",
      targetType: "DOCUMENT",
      targetId: doc.id,
      metadata: JSON.stringify({ fileName: data.fileName }),
    });

    // Notify staff if a client uploaded a document
    if ((session.user as any).role === "CLIENT") {
      const adminEmail = process.env.ADMIN_EMAIL || "Jsimpson@yourtaxsource.com";
      await notifyDocumentUpload(adminEmail, session.user.name || session.user.email!, data.fileName);
    }

    revalidatePath("/portal/documents");
    revalidatePath("/admin/returns");
    if (data.returnId) {
      revalidatePath(`/admin/returns/${data.returnId}`);
    }
    
    return doc;
  } catch (err) {
    console.error("registerDocument: Failed to insert document record", err);
    throw err;
  }
}

export async function getDownloadUrl(documentId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
  });

  if (!doc) throw new Error("Document not found");

  // Basic security: Only owner or Staff/Admin can download
  const isOwner = doc.userId === (session.user as any).id;
  const isStaff = ["STAFF", "ADMIN"].includes((session.user as any).role);

  if (!isOwner && !isStaff) throw new Error("Forbidden");

  // If client is the owner, check if the document is locked
  if (isOwner && !isStaff && doc.isLocked) {
    // If it's a final return, check if it's paid
    if (doc.category === "Final Returns" && doc.returnId) {
      const taxReturn = await db.query.taxReturns.findFirst({
        where: eq(taxReturns.id, doc.returnId),
      });
      
      if (taxReturn?.paymentStatus !== "PAID") {
        throw new Error("This document is locked until your tax preparation fee is paid. Please visit the Payments section on your dashboard.");
      }
    } else {
      throw new Error("This document is currently locked.");
    }
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: doc.s3Key,
  });

  const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  await db.insert(auditLogs).values({
    userId: (session.user as any).id,
    action: "DOWNLOAD_DOCUMENT",
    targetType: "DOCUMENT",
    targetId: documentId,
  });

  return downloadUrl;
}

export async function getUserDocuments(year?: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id;
  const conditions = [
    eq(documents.userId, userId),
    sql`${documents.deletedAt} IS NULL`,
    not(eq(documents.category, "ADMIN_ONLY"))
  ];

  if (year) {
    conditions.push(eq(documents.taxYear, year));
  }

  const docs = await db.query.documents.findMany({
    where: and(...conditions),
    with: {
      taxReturn: true,
    },
    orderBy: (docs, { desc }) => [desc(docs.uploadedAt)],
  });

  // Map to adjust isLocked based on payment status for Final Returns
  return docs.map(doc => {
    let isLocked = doc.isLocked;
    
    // If it's a final return and the associated return is paid, unlock it
    if (doc.category === "Final Returns" && doc.taxReturn?.paymentStatus === "PAID") {
      isLocked = false;
    }
    
    return {
      ...doc,
      isLocked
    };
  });
}

export async function getUserDocumentYears() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id;
  const result = await db.select({ year: documents.taxYear })
    .from(documents)
    .where(and(
      eq(documents.userId, userId),
      sql`${documents.deletedAt} IS NULL`,
      isNotNull(documents.taxYear)
    ))
    .groupBy(documents.taxYear)
    .orderBy(desc(documents.taxYear));

  return result.map(r => r.year as number);
}

export async function getDocumentReviewQueue() {
  const session = await auth();
  if (!session?.user || (session.user as any).role === "CLIENT") throw new Error("Unauthorized");

  return db.query.documents.findMany({
    where: and(
      eq(documents.status, "PENDING"),
      sql`${documents.deletedAt} IS NULL`
    ),
    with: {
      user: true,
      taxReturn: true,
    },
    orderBy: (docs, { desc }) => [desc(docs.uploadedAt)],
  });
}

export async function reviewDocument(documentId: string, status: "ACCEPTED" | "REJECTED" | "CLARIFICATION_REQUESTED", feedback?: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role === "CLIENT") throw new Error("Unauthorized");

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
    with: {
      user: {
        with: {
          profile: true,
        }
      },
    }
  });

  if (!doc) throw new Error("Document not found");

  await db.update(documents)
    .set({
      status,
      reviewFeedback: feedback,
      reviewedAt: new Date(),
      reviewedBy: (session.user as any).id,
    })
    .where(eq(documents.id, documentId));

  // Audit Log
  await db.insert(auditLogs).values({
    userId: (session.user as any).id,
    action: `REVIEW_DOCUMENT_${status}`,
    targetType: "DOCUMENT",
    targetId: documentId,
    metadata: JSON.stringify({ status, feedback }),
  });

  // Notification
  if (doc.user.email) {
    await notifyDocumentStatusUpdate(
      doc.user.email, 
      doc.user.profile?.phone || null, 
      doc.fileName, 
      status, 
      feedback
    );
  }

  revalidatePath("/admin/returns");
  if (doc.returnId) {
    revalidatePath(`/admin/returns/${doc.returnId}`);
  }
  revalidatePath("/portal/documents");
}

export async function markRequestComplete(requestId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const log = await db.query.auditLogs.findFirst({
    where: eq(auditLogs.id, requestId),
  });

  if (!log) throw new Error("Request not found");

  // Security: Only target user or Admin can mark as complete
  const isTargetUser = log.targetId === (session.user as any).id;
  const isAdmin = (session.user as any).role === "ADMIN";

  if (!isTargetUser && !isAdmin) throw new Error("Forbidden");

  await db.update(auditLogs)
    .set({ status: "COMPLETED" })
    .where(eq(auditLogs.id, requestId));

  revalidatePath("/portal");
  revalidatePath("/admin/returns");
}
