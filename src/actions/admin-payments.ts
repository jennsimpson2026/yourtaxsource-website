"use server";

import { db } from "@/lib/db";
import { taxReturns, invoices, auditLogs } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { releaseReturnDocuments } from "@/lib/returns";
import { notifyAdminPaymentReceived, sendEmailDirect } from "@/lib/notifications";

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

/** Helper: return's balance due = adjustedFee (taxPrepFee - waivers) minus sum of PAID invoices. */
async function computeBalanceDue(returnId: string) {
  const taxReturn = await db.query.taxReturns.findFirst({
    where: eq(taxReturns.id, returnId),
  });
  if (!taxReturn) throw new Error("Return not found");

  const allInvoices = await db.query.invoices.findMany({
    where: eq(invoices.returnId, returnId),
  });
  const totalPaid = allInvoices
    .filter(inv => inv.status === "PAID")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const prepFee = Number(taxReturn.taxPrepFee || 0);
  const waived = Number(taxReturn.waivedAmount || 0);
  const adjustedFee = Math.max(0, prepFee - waived);
  const balanceDue = Math.max(0, adjustedFee - totalPaid);
  return { taxReturn, totalPaid, adjustedFee, balanceDue };
}

/**
 * Sends (or resends) a "payment request" email to the client for a specific unpaid invoice.
 *
 * CRITICAL: This action ONLY sends the branded email and records tracking/audit logs.
 * It does NOT create any Stripe session, mark an invoice PAID, change return status,
 * release documents, or touch the Stripe webhook / payment flow in any way.
 */
export async function sendPaymentRequest(returnId: string, invoiceId: string) {
  const user = await ensureAdmin();

  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
  });
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.returnId !== returnId) throw new Error("Invoice does not belong to this return");

  // Load return + client (relation) for email recipient + balance
  const returnResult = await db.query.taxReturns.findFirst({
    where: eq(taxReturns.id, returnId),
    with: { client: true },
  });
  if (!returnResult) throw new Error("Return not found");
  if (!returnResult.client?.email) throw new Error("Client has no email address");

  const { balanceDue } = await computeBalanceDue(returnId);

  const recipient = returnResult.client.email;
  const firstName = (returnResult.client.name || "Client").trim().split(/\s+/)[0] || "Client";
  const adminId = (user as any).id;
  const adminName = (user as any).name || (user as any).email || "Admin";
  const previousCount = Number(invoice.paymentRequestCount || 0);
  const sendCount = previousCount + 1;
  const resent = previousCount >= 1;

  const portalUrl = `${(process.env.NEXTAUTH_URL || "https://your-tax-source-main.vercel.app").replace(/\/$/, "")}/portal#invoices`;

  const subject = "Your Tax Source — Your Tax Return Is Ready for Payment";
  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
      <div style="border-bottom: 1px solid #f3f4f6; padding-bottom: 16px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #1e1e3f;">Your Tax Source</h1>
        <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">Secure Client Portal</p>
      </div>
      <p style="font-size: 15px; color: #374151;">Hi ${escapeHtml(firstName)},</p>
      <p style="font-size: 15px; color: #374151; line-height: 1.6;">
        Your tax return has reached the payment stage. Your current balance is
        <strong style="color: #1e1e3f; font-size: 17px;">${balanceDue.toFixed(2)}</strong>.
      </p>
      <p style="font-size: 15px; color: #374151; line-height: 1.6;">
        Please sign in to your secure Your Tax Source portal to review your balance and complete payment.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${portalUrl}" style="display: inline-block; background: #6d28d9; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 12px;">
          View &amp; Pay Invoice
        </a>
      </div>
      <p style="font-size: 13px; color: #6b7280; line-height: 1.6;">
        Once payment is successfully completed, your final tax return documents will be released according to the return's document-release settings.
      </p>
      <p style="margin-top: 24px; font-size: 15px; color: #374151;">Thank you,<br/><strong>Your Tax Source</strong></p>
      <div style="border-top: 1px solid #f3f4f6; margin-top: 24px; padding-top: 12px; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #9ca3af;">Belmont, NC • Your Tax Source Secure Portal</p>
      </div>
    </div>
  `;

  // Only email + tracking — explicitly no payment/status/document changes.
  await sendEmailDirect({ to: recipient, subject, html });

  // Update invoice tracking
  await db.update(invoices)
    .set({
      paymentRequestCount: sendCount,
      paymentRequestLastSentAt: new Date(),
      paymentRequestRecipientEmail: recipient,
      paymentRequestSentByUserId: adminId,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));

  // Audit log — visible in Communication Log + Audit Log (Financial History)
  await db.insert(auditLogs).values({
    userId: adminId,
    action: "PAYMENT_REQUEST_SENT",
    targetType: "INVOICE",
    targetId: invoiceId,
    metadata: JSON.stringify({
      invoiceId,
      amount: Number(invoice.amount),
      recipient,
      adminId,
      adminName,
      sendCount,
      resent,
      balanceDue,
    }),
  });

  logger.info(`[admin-payments] Payment request ${resent ? "resent" : "sent"} for invoice ${invoiceId} (send #${sendCount}) to ${recipient}`, { adminId, invoiceId });

  revalidatePath(`/admin/returns/${returnId}`);
  return { success: true, sendCount, resent, recipient };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
