"use server";

import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { notifyDocumentRequest } from "@/lib/notifications";

export async function requestDocuments(clientId: string, returnId: string, documentList: string) {
  const session = await getServerSession(authOptions);
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
  await db.insert(auditLogs).values({
    userId: (session.user as any).id,
    action: "REQUEST_DOCUMENTS",
    targetType: "CLIENT",
    targetId: clientId,
    metadata: JSON.stringify({ returnId, documentList }),
  });

  revalidatePath(`/admin/returns/${returnId}`);
}
