"use server";

import { db } from "@/lib/db";
import { taxReturns, auditLogs, users, profiles, invoices } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { notifyStatusUpdate, notifyAdminPaymentReceived } from "@/lib/notifications";
import { logger } from "@/lib/logger";
import { releaseReturnDocuments } from "@/lib/returns";
import { logAction } from "@/lib/audit";

export async function updateReturnDetails(returnId: string, data: {
  status?: string;
  paymentStatus?: string;
  notes?: string;
  federalResult?: number;
  stateResults?: any;
  taxPrepFee?: number;
  manualRelease?: boolean;
  isComplimentary?: boolean;
}) {
  const session = await auth();
  if (!session?.user || (session.user as any).role === "CLIENT") throw new Error("Unauthorized");

  // Fetch current state for atomicity
  const currentReturn = await db.query.taxReturns.findFirst({
    where: eq(taxReturns.id, returnId),
  });
  if (!currentReturn) throw new Error("Return not found");

  const updateData: any = { updatedAt: new Date() };
  
  if (data.status) updateData.status = data.status;
  if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.federalResult !== undefined) updateData.federalResult = data.federalResult;
  if (data.stateResults !== undefined) updateData.stateResults = data.stateResults;
  if (data.taxPrepFee !== undefined) updateData.taxPrepFee = data.taxPrepFee;

  // Automation: (AWAITING_PAYMENT or READY_FOR_SIGNATURE) + PAID = READY_TO_FILE
  const finalPaymentStatus = data.paymentStatus || currentReturn.paymentStatus;
  let finalStatus = data.status || currentReturn.status;

  // Verify full payment before allowing READY_TO_FILE
  const allInvoices = await db.query.invoices.findMany({
    where: eq(invoices.returnId, returnId),
  });
  
  const totalPaid = allInvoices
    .filter(inv => inv.status === "PAID")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);
  
  const hasUnpaidInvoices = allInvoices.some(inv => inv.status === "UNPAID");
  const taxPrepFee = data.taxPrepFee !== undefined ? data.taxPrepFee : Number(currentReturn.taxPrepFee || 0);
  
  // STRICT: Ready to File is ONLY allowed if balance is $0 and no unpaid invoices exist
  const balanceDue = Math.max(0, taxPrepFee - totalPaid);
  const isFullyPaid = balanceDue <= 0 && !hasUnpaidInvoices;

  if (isFullyPaid && ["AWAITING_PAYMENT", "READY_FOR_SIGNATURE"].includes(finalStatus)) {
    logger.info(`[updateReturnDetails] Auto-transitioning return ${returnId} to READY_TO_FILE`);
    finalStatus = "READY_TO_FILE";
    updateData.status = "READY_TO_FILE";
  }

  // FORCE: If status is READY_TO_FILE but balance is due or unpaid invoices exist, force status back to AWAITING_PAYMENT
  // This handles manual status changes that don't respect the payment rule
  if (finalStatus === "READY_TO_FILE" && !isFullyPaid && data.paymentStatus !== "PAID") {
    logger.info(`[updateReturnDetails] FORCING status back to AWAITING_PAYMENT because balance is due or unpaid invoices exist`);
    finalStatus = "AWAITING_PAYMENT";
    updateData.status = "AWAITING_PAYMENT";
  }

  logger.info(`[updateReturnDetails] Updating return ${returnId}`, updateData);

  const [updatedReturn] = await db.update(taxReturns)
    .set(updateData)
    .where(eq(taxReturns.id, returnId))
    .returning();

  if (updatedReturn) {
    // 1. Ensure an invoice exists if taxPrepFee > 0 and no invoices exist
    if (updatedReturn.taxPrepFee && Number(updatedReturn.taxPrepFee) > 0) {
      const existingInvoices = await db.query.invoices.findMany({
        where: eq(invoices.returnId, returnId),
      });

      if (existingInvoices.length === 0) {
        logger.info(`[updateReturnDetails] Creating initial UNPAID invoice for fee: ${updatedReturn.taxPrepFee}`);
        await db.insert(invoices).values({
          userId: updatedReturn.clientId,
          returnId: returnId,
          amount: updatedReturn.taxPrepFee,
          status: "UNPAID",
        });
      }
    }

    const client = await db.query.users.findFirst({
      where: eq(users.id, updatedReturn.clientId),
      with: {
        profile: true,
      },
    });

    if (client) {
      if (data.status || updateData.status !== currentReturn.status) {
        await notifyStatusUpdate(client.email, client.profile?.phone || null, updatedReturn.status);
      }

      if (updatedReturn.paymentStatus === "PAID" || data.manualRelease === true || data.isComplimentary === true) {
        // Release documents on payment or manual release
        logger.info(`[updateReturnDetails] Releasing documents for return ${returnId}`);
        await releaseReturnDocuments(returnId, (session.user as any).id);

        if (updatedReturn.paymentStatus === "PAID") {
          const allInvoices = await db.query.invoices.findMany({
            where: eq(invoices.returnId, returnId),
          });
          
          const unpaidInvoices = allInvoices.filter(inv => inv.status === "UNPAID");
          const totalPaid = allInvoices
            .filter(inv => inv.status === "PAID")
            .reduce((sum, inv) => sum + Number(inv.amount), 0);
          
          let totalAmount = 0;
          
          // Mark invoices as paid if manual payment entry
          if (unpaidInvoices.length > 0) {
            logger.info(`[updateReturnDetails] Marking ${unpaidInvoices.length} invoices as PAID`);
            await db.update(invoices)
              .set({ status: "PAID", paidAt: new Date() })
              .where(and(eq(invoices.returnId, returnId), eq(invoices.status, "UNPAID")));
            totalAmount = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
          } else if (totalPaid < Number(updatedReturn.taxPrepFee)) {
            // Only create a new PAID invoice if the total paid so far is less than the fee
            const remainingToPay = Math.max(0, Number(updatedReturn.taxPrepFee) - totalPaid);
            if (remainingToPay > 0) {
              logger.info(`[updateReturnDetails] Creating a PAID invoice for remaining balance: ${remainingToPay}`);
              await db.insert(invoices).values({
                userId: updatedReturn.clientId,
                returnId: returnId,
                amount: remainingToPay,
                status: "PAID",
                paidAt: new Date(),
              });
              totalAmount = remainingToPay;
            }
          } else {
            logger.info(`[updateReturnDetails] Return is already fully paid (Paid: ${totalPaid}, Fee: ${updatedReturn.taxPrepFee}). No new invoice created.`);
            totalAmount = totalPaid;
          }

          try {
            await notifyAdminPaymentReceived({
              clientName: client.name || "Client",
              amount: totalAmount,
              method: "Manual Entry (Admin)",
              invoiceReference: `Return ${updatedReturn.year}`,
            });
          } catch (notifErr) {
            logger.error("[updateReturnDetails] Notification failed but proceeding:", notifErr);
          }
        }
      }
    }
  }

  await logAction({
    userId: session.user.id,
    action: "UPDATE_RETURN_DETAILS",
    targetType: "TAX_RETURN",
    targetId: returnId,
    metadata: data,
  });

  revalidatePath(`/admin/returns/${returnId}`);
  revalidatePath("/admin/returns");
  revalidatePath("/admin");
}

export async function updateReturnStatus(returnId: string, status: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role === "CLIENT") throw new Error("Unauthorized");

  // Fetch current state to check balance if moving to READY_TO_FILE
  const currentReturn = await db.query.taxReturns.findFirst({
    where: eq(taxReturns.id, returnId),
    with: {
      invoices: true,
    }
  });

  if (!currentReturn) throw new Error("Return not found");

  let finalStatus = status;

  // STRICT: Ready to File is ONLY allowed if balance is $0 and no unpaid invoices exist
  if (status === "READY_TO_FILE") {
    const totalPaid = currentReturn.invoices
      .filter(inv => inv.status === "PAID")
      .reduce((sum, inv) => sum + Number(inv.amount), 0);
    const balanceDue = Math.max(0, Number(currentReturn.taxPrepFee || 0) - totalPaid);
    const hasUnpaidInvoices = currentReturn.invoices.some(inv => inv.status === "UNPAID");

    if ((balanceDue > 0 || hasUnpaidInvoices) && currentReturn.paymentStatus !== "PAID") {
      logger.info(`[updateReturnStatus] Blocking transition to READY_TO_FILE because balance is due or unpaid invoices exist`);
      // Fallback to AWAITING_PAYMENT if they try to move to READY_TO_FILE with balance
      finalStatus = "AWAITING_PAYMENT";
    }
  }

  const [updatedReturn] = await db.update(taxReturns)
    .set({ status: finalStatus as any, updatedAt: new Date() })
    .where(eq(taxReturns.id, returnId))
    .returning();

  if (updatedReturn) {
    const client = await db.query.users.findFirst({
      where: eq(users.id, updatedReturn.clientId),
      with: {
        profile: true,
      },
    });

    if (client) {
      await notifyStatusUpdate(client.email, client.profile?.phone || null, status);
    }
  }

  await logAction({
    userId: session.user.id,
    action: "UPDATE_RETURN_STATUS",
    targetType: "TAX_RETURN",
    targetId: returnId,
    metadata: { newStatus: status },
  });

  revalidatePath(`/admin/returns/${returnId}`);
  revalidatePath("/admin/returns");
  revalidatePath("/admin");
}

export async function manualReleaseReturn(returnId: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role === "CLIENT") throw new Error("Unauthorized");

  await db.update(taxReturns)
    .set({ manualRelease: true, updatedAt: new Date() })
    .where(eq(taxReturns.id, returnId));

  await releaseReturnDocuments(returnId, (session.user as any).id);

  revalidatePath(`/admin/returns/${returnId}`);
  revalidatePath("/admin/returns");
  return { success: true };
}

export async function markReturnAsComplimentary(returnId: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role === "CLIENT") throw new Error("Unauthorized");

  await db.update(taxReturns)
    .set({ isComplimentary: true, paymentStatus: "PAID", updatedAt: new Date() })
    .where(eq(taxReturns.id, returnId));

  await releaseReturnDocuments(returnId, (session.user as any).id);

  revalidatePath(`/admin/returns/${returnId}`);
  revalidatePath("/admin/returns");
  return { success: true };
}

export async function setReturnFee(returnId: string, amount: number) {
  const session = await auth();
  if (!session?.user || (session.user as any).role === "CLIENT") throw new Error("Unauthorized");

  // Find existing invoice or create new one
  const existingInvoice = await db.query.invoices.findFirst({
    where: and(eq(invoices.returnId, returnId), eq(invoices.status, "UNPAID")),
  });

  if (existingInvoice) {
    await db.update(invoices)
      .set({ amount: amount })
      .where(eq(invoices.id, existingInvoice.id));
  } else {
    const taxReturn = await db.query.taxReturns.findFirst({
      where: eq(taxReturns.id, returnId),
    });
    if (!taxReturn) throw new Error("Return not found");

    await db.insert(invoices).values({
      userId: taxReturn.clientId,
      returnId: returnId,
      amount: amount,
      status: "UNPAID",
    });
  }

  await logAction({
    userId: session.user.id,
    action: "SET_RETURN_FEE",
    targetType: "TAX_RETURN",
    targetId: returnId,
    metadata: { amount },
  });

  revalidatePath(`/admin/returns/${returnId}`);
  return { success: true };
}
