"use server";

import { syncPaymentToQbo } from "@/lib/qbo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export async function manualSyncInvoice(invoiceId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const qboSalesReceiptId = await syncPaymentToQbo(invoiceId);
    
    await db.insert(auditLogs).values({
      userId: (session.user as any).id,
      action: "QBO_MANUAL_SYNC",
      targetType: "INVOICE",
      targetId: invoiceId,
      metadata: JSON.stringify({ qboSalesReceiptId }),
    });

    return { success: true, qboSalesReceiptId };
  } catch (error: any) {
    console.error("Manual QBO Sync Error:", error.message);
    return { success: false, error: error.message };
  }
}
