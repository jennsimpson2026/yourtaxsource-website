import { db } from "@/lib/db";
import { taxReturns, documents, auditLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Releases documents for a tax return by setting isLocked to false.
 * This is triggered when payment is received or when an admin manually releases the return.
 */
export async function releaseReturnDocuments(returnId: string, releasedByUserId?: string) {
  // 1. Get the return details
  const taxReturn = await db.query.taxReturns.findFirst({
    where: eq(taxReturns.id, returnId),
  });

  if (!taxReturn) {
    throw new Error("Tax return not found");
  }

  // 2. Unlock all documents associated with this return
  await db.update(documents)
    .set({ isLocked: false })
    .where(eq(documents.returnId, returnId));

  // 3. Log the action
  await db.insert(auditLogs).values({
    userId: releasedByUserId || null,
    action: "DOCUMENTS_RELEASED",
    targetType: "TAX_RETURN",
    targetId: returnId,
    metadata: JSON.stringify({ manual: !!releasedByUserId }),
  });

  return { success: true };
}
