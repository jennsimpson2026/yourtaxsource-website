"use server";

import { db } from "@/lib/db";
import { auditLogs, users, profiles, annualUpdates } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { notifyDocumentRequest } from "@/lib/notifications";
import { decrypt } from "@/lib/crypto";
import { logAction, logPiiRead } from "@/lib/audit";
import { logger } from "@/lib/logger";

export async function getSensitiveClientData(clientId: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role === "CLIENT") {
    throw new Error("Unauthorized");
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, clientId),
  });

  const annualUpdate = await db.query.annualUpdates.findFirst({
    where: eq(annualUpdates.clientId, clientId),
    orderBy: (au, { desc }) => [desc(au.createdAt)],
  });

  const data: any = {};

  if (profile?.encryptedSsn) {
    try {
      data.ssn = decrypt(profile.encryptedSsn);
    } catch (e) {
      logger.error("Failed to decrypt SSN", { error: e, clientId });
    }
  }

  if (annualUpdate?.bankingInfo) {
    try {
      const banking = JSON.parse(annualUpdate.bankingInfo);
      if (banking.accountNumber) {
        banking.accountNumber = decrypt(banking.accountNumber);
      }
      data.banking = banking;
    } catch (e) {
      logger.error("Failed to decrypt banking info", { error: e, clientId });
    }
  }

  if (annualUpdate?.dependents) {
    try {
      const dependents = JSON.parse(annualUpdate.dependents);
      dependents.forEach((d: any) => {
        if (d.ssn) d.ssn = decrypt(d.ssn);
      });
      data.dependents = dependents;
    } catch (e) {
      logger.error("Failed to decrypt dependents", { error: e, clientId });
    }
  }

  // Log the access
  const fields = [];
  if (data.ssn) fields.push("SSN");
  if (data.banking) fields.push("Banking Info");
  if (data.dependents) fields.push("Dependents SSN");

  if (fields.length > 0) {
    await logPiiRead((session.user as any).id, clientId, fields);
  }

  return data;
}

export async function requestDocuments(clientId: string, returnId: string, documentList: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role === "CLIENT") {
    throw new Error("Unauthorized");
  }

  const client = await db.query.users.findFirst({
    where: eq(users.id, clientId),
    with: {
      profile: true,
    },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  // Send notification
  await notifyDocumentRequest(client.email, client.profile?.phone || null, documentList);

  // Log the action
  await logAction({
    userId: (session.user as any).id,
    action: "REQUEST_DOCUMENT",
    targetType: "CLIENT",
    targetId: clientId,
    metadata: { returnId, documentList },
  });

  revalidatePath(`/admin/returns/${returnId}`);
}
