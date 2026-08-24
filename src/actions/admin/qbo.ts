"use server";

import { logger } from "@/lib/logger";
import { logAction } from "@/lib/audit";
import { syncPaymentToQbo } from "@/lib/qbo";
import { auth } from "@/lib/auth";

import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export async function manualSyncInvoice(invoiceId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const qboSalesReceiptId = await syncPaymentToQbo(invoiceId);
    
    await logAction({
      userId: (session.user as any).id,
      action: "QBO_MANUAL_SYNC",
      targetType: "INVOICE",
      targetId: invoiceId,
      metadata: { qboSalesReceiptId },
    });

    return { success: true, qboSalesReceiptId };
  } catch (error: any) {
    logger.error("Manual QBO Sync Error:", error.message);
    return { success: false, error: error.message };
  }
}
