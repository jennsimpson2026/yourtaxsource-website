"use server";

import { db } from "@/lib/db";
import { taxReturns, invoices, auditLogs } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { releaseReturnDocuments } from "@/lib/returns";
import { notifyAdminPaymentReceived } from "@/lib/notifications";

/**
 * Admin-only payment and financial management actions.
 * These actions power the Admin Payment Center hub.
 */

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role === "CLIENT") {
    throw new Error("Unauthorized: Admin or Staff only");
  }
  return session.user;
}

export async function toggleManualRelease(returnId: string, enabled: boolean) {
  const user = await ensureAdmin();
  logger.info(`[admin-payments] Toggling manual release for return ${returnId}: ${enabled}`, { adminId: (user as any).id });

  await db.update(taxReturns)
    .set({ manualRelease: enabled, updatedAt: new Date() })
    .where(eq(taxReturns.id, returnId));

  if (enabled) {
    await releaseReturnDocuments(returnId, (user as any).id);
  }

  await db.insert(auditLogs).values({
    userId: (user as any).id,
    action: "MANUAL_RELEASE_TOGGLED",
    targetType: "TAX_RETURN",
    targetId: returnId,
    metadata: JSON.stringify({ manualRelease: enabled }),
  });

  revalidatePath(`/admin/returns/${returnId}`);
  return { success: true };
}

export async function toggleSurcharge(returnId: string, enabled: boolean) {
  const user = await ensureAdmin();
  logger.info(`[admin-payments] Toggling surcharge for return ${returnId}: ${enabled}`, { adminId: (user as any).id });

  await db.update(taxReturns)
    .set({ isSurchargeEnabled: enabled, updatedAt: new Date() })
    .where(eq(taxReturns.id, returnId));

  await db.insert(auditLogs).values({
    userId: (user as any).id,
    action: "SURCHARGE_TOGGLED",
    targetType: "TAX_RETURN",
    targetId: returnId,
    metadata: JSON.stringify({ isSurchargeEnabled: enabled }),
  });

  revalidatePath(`/admin/returns/${returnId}`);
  return { success: true };
}

export async function applyFeeAdjustment(returnId: string, amount: number, reason: string) {
  const user = await ensureAdmin();
  logger.info(`[admin-payments] Applying fee adjustment for return ${returnId}: $${amount} (${reason})`, { adminId: (user as any).id });

  const currentReturn = await db.query.taxReturns.findFirst({
    where: eq(taxReturns.id, returnId),
  });
  if (!currentReturn) throw new Error("Return not found");

  const newWaived = Number(currentReturn.waivedAmount || 0) + Number(amount);

  await db.update(taxReturns)
    .set({ waivedAmount: newWaived, updatedAt: new Date() })
    .where(eq(taxReturns.id, returnId));

  await db.insert(auditLogs).values({
    userId: (user as any).id,
    action: "ADJUSTMENT_APPLIED",
    targetType: "TAX_RETURN",
    targetId: returnId,
    metadata: JSON.stringify({ amount, reason, newWaived }),
  });

  revalidatePath(`/admin/returns/${returnId}`);
  return { success: true };
}

export async function recordManualPayment(returnId: string, amount: number, method: string) {
  const user = await ensureAdmin();
  logger.info(`[admin-payments] Recording manual payment for return ${returnId}: $${amount} via ${method}`, { adminId: (user as any).id });

  const taxReturn = await db.query.taxReturns.findFirst({
    where: eq(taxReturns.id, returnId),
    with: { client: true },
  });
  if (!taxReturn) throw new Error("Return not found");

  // Create a PAID invoice for this amount
  const [invoice] = await db.insert(invoices).values({
    userId: taxReturn.clientId,
    returnId: returnId,
    amount: amount,
    status: "PAID",
    paidAt: new Date(),
  }).returning();

  // Check if return should be marked PAID
  const allInvoices = await db.query.invoices.findMany({
    where: eq(invoices.returnId, returnId),
  });
  const totalPaid = allInvoices
    .filter(inv => inv.status === "PAID")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);
  
  const prepFee = Number(taxReturn.taxPrepFee || 0);
  const waived = Number(taxReturn.waivedAmount || 0);
  const adjustedFee = Math.max(0, prepFee - waived);

  if (totalPaid >= adjustedFee) {
    await db.update(taxReturns)
      .set({ paymentStatus: "PAID", updatedAt: new Date() })
      .where(eq(taxReturns.id, returnId));
    
    // Automatically release documents if fully paid
    await releaseReturnDocuments(returnId, (user as any).id);
  }

  await db.insert(auditLogs).values({
    userId: (user as any).id,
    action: "PAYMENT_RECORDED",
    targetType: "INVOICE",
    targetId: invoice.id,
    metadata: JSON.stringify({ amount, method }),
  });

  try {
    await notifyAdminPaymentReceived({
      clientName: taxReturn.client.name || "Client",
      amount: amount,
      method: `${method} (Manual Entry)`,
      invoiceReference: invoice.id,
    });
  } catch (e) {
    // best effort
  }

  revalidatePath(`/admin/returns/${returnId}`);
  return { success: true };
}

export async function createOneOffInvoice(returnId: string, amount: number) {
  const user = await ensureAdmin();
  logger.info(`[admin-payments] Creating one-off invoice for return ${returnId}: $${amount}`, { adminId: (user as any).id });

  const taxReturn = await db.query.taxReturns.findFirst({
    where: eq(taxReturns.id, returnId),
  });
  if (!taxReturn) throw new Error("Return not found");

  const [invoice] = await db.insert(invoices).values({
    userId: taxReturn.clientId,
    returnId: returnId,
    amount: amount,
    status: "UNPAID",
  }).returning();

  await db.insert(auditLogs).values({
    userId: (user as any).id,
    action: "CREATE_INVOICE",
    targetType: "INVOICE",
    targetId: invoice.id,
    metadata: JSON.stringify({ amount }),
  });

  revalidatePath(`/admin/returns/${returnId}`);
  return invoice;
}
