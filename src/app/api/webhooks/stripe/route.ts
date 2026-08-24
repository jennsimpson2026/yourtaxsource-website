import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, validateStripeWebhook } from "@/lib/stripe";
import { db } from "@/lib/db";
import { invoices, taxReturns, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { smartReconcileToQbo } from "@/lib/qbo-reconcile";
import { notifyPaymentReceived, notifyAdminPaymentReceived } from "@/lib/notifications";
import { releaseReturnDocuments } from "@/lib/returns";
import { computeCreditCardSurcharge } from "@/lib/surcharge";
import { logger } from "@/lib/logger";

/**
 * Stripe webhooks — STRIPE TEST MODE ONLY.
 * Handles successful payments, refunds, and failures. Uses the same
 * 'Credit Card Surcharge' rules; documents unlock only at a $0 balance.
 *
 * NOTE: This is a NEW Stripe route. Existing Helcim and QBO webhook routes
 * are untouched.
 */
export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = validateStripeWebhook(payload, sig);
  } catch (err: any) {
    logger.error("Stripe webhook signature verification failed", { error: err?.message });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await recordPaymentFailure(session.metadata?.invoiceId, "ASYNC_PAYMENT_FAILED");
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await recordPaymentFailure(pi.metadata?.invoiceId, "PAYMENT_FAILED");
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefunded(charge);
        break;
      }
      default:
        logger.info(`Unhandled Stripe webhook event: ${event.type}`);
        break;
    }
  } catch (err: any) {
    // Never fail the Stripe delivery retry on our own housekeeping errors.
    logger.error("Stripe webhook handler error", { error: err?.message, eventType: event.type });
  }

  return NextResponse.json({ received: true });
}

async function resolveInvoiceFromSession(session: Stripe.Checkout.Session) {
  const invoiceId = session.metadata?.invoiceId;
  if (!invoiceId) return null;
  return await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
    with: {
      user: { with: { profile: true } },
      taxReturn: true,
    },
  });
}

async function resolveFunding(stripe: Stripe, session: Stripe.Checkout.Session): Promise<string> {
  try {
    if (session.payment_intent) {
      const pi = await stripe.paymentIntents.retrieve(String(session.payment_intent), {
        expand: ["payment_method"],
      });
      const pm = pi.payment_method as Stripe.PaymentMethod | null;
      return pm?.card?.funding ?? "unknown";
    }
  } catch (e) {
    // ignore - fall back to unknown
  }
  return "unknown";
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const stripe = getStripe();
  const invoice = await resolveInvoiceFromSession(session);
  if (!invoice) {
    logger.error("Stripe webhook: Invoice not found for session", {
      sessionId: session.id,
      invoiceId: session.metadata?.invoiceId,
    });
    return;
  }
  if (invoice.status === "PAID") {
    logger.info("Stripe webhook: Invoice already marked as PAID", {
      invoiceId: invoice.id,
      sessionId: session.id,
    });
    return;
  }

  const funding = await resolveFunding(stripe, session);

  logger.info("Stripe checkout processing", {
    invoiceId: invoice.id,
    sessionId: session.id,
    funding,
  });
  const baseAmountCents = Math.round(Number(invoice.amount) * 100);
  const surchargeEnabled = Boolean((invoice.taxReturn as any)?.isSurchargeEnabled);
  // Never surcharge debit/prepaid; otherwise lower of 3% or actual cost.
  const surchargeCents = surchargeEnabled
    ? computeCreditCardSurcharge(baseAmountCents, { funding })
    : 0;
  const surchargeAmount = surchargeCents / 100;
  const paymentIntentId = session.payment_intent ? String(session.payment_intent) : null;

  // Mark invoice paid.
  await db
    .update(invoices)
    .set({
      status: "PAID",
      paidAt: new Date(),
      stripePaymentIntentId: paymentIntentId,
      surchargeAmount,
    })
    .where(eq(invoices.id, invoice.id));

  // Mark payment status paid. NOTE: this does NOT set the return status to
  // READY_TO_FILE — that transition is always a manual staff action.
  await db
    .update(taxReturns)
    .set({ paymentStatus: "PAID", updatedAt: new Date() })
    .where(eq(taxReturns.id, invoice.returnId));

  // Documents unlock at a $0 balance OR via manual override — never on
  // payment alone. Compute the return's total remaining balance.
  const allInvoices = await db.query.invoices.findMany({
    where: eq(invoices.returnId, invoice.returnId),
  });
  const totalPaid = allInvoices
    .filter((i) => i.status === "PAID")
    .reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const prepFees = Number((invoice.taxReturn as any)?.taxPrepFee || 0);
  const waived = Number((invoice.taxReturn as any)?.waivedAmount || 0);
  const adjustedFee = Math.max(0, prepFees - waived);
  const balance = Math.max(0, adjustedFee - totalPaid);

  if (
    balance === 0 ||
    (invoice.taxReturn as any)?.manualRelease === true ||
    (invoice.taxReturn as any)?.isComplimentary === true
  ) {
    await releaseReturnDocuments(invoice.returnId).catch(() => {});
  }

  // Audit trail.
  await db.insert(auditLogs).values({
    userId: invoice.userId,
    action: "PAYMENT_RECEIVED_STRIPE",
    targetType: "INVOICE",
    targetId: invoice.id,
    metadata: JSON.stringify({
      amount: invoice.amount,
      surchargeAmount,
      funding,
      paymentIntentId,
      mode: "TEST MODE",
    }),
  });

  // QBO Smart Reconciliation (Invoice -> Payment, fallback Sales Receipt).
  await smartReconcileToQbo(invoice, surchargeAmount).catch((err) => {
    logger.error("QBO reconciliation failed (non-blocking)", { error: err?.message, invoiceId: invoice.id });
  });

  // Notifications.
  try {
    await notifyPaymentReceived(
      invoice.user.email,
      (invoice.user as any).profile?.phone || null,
      Number(invoice.amount)
    );
    await notifyAdminPaymentReceived({
      clientName: (invoice.user as any).name || "Client",
      amount: Number(invoice.amount),
      method: "Stripe (TEST MODE)",
      invoiceReference: invoice.id,
    });
  } catch (e) {
    // notifications are best-effort
  }
}

async function recordPaymentFailure(invoiceId: string | undefined, action: string) {
  if (!invoiceId) {
    logger.warn("Stripe payment failure recorded without invoiceId", { action });
    return;
  }
  const invoice = await db.query.invoices.findFirst({ where: eq(invoices.id, invoiceId) });
  if (!invoice) {
    logger.error("Stripe payment failure: Invoice not found", { invoiceId, action });
    return;
  }
  logger.warn("Stripe payment failure recorded", { invoiceId, action });
  await db.insert(auditLogs).values({
    userId: invoice.userId,
    action,
    targetType: "INVOICE",
    targetId: invoice.id,
    metadata: JSON.stringify({ mode: "TEST MODE" }),
  });
}

async function handleRefunded(charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === "string"
    ? charge.payment_intent
    : (charge.payment_intent as any)?.id;
  if (!paymentIntentId) {
    logger.warn("Stripe refund received without paymentIntentId", { chargeId: charge.id });
    return;
  }

  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.stripePaymentIntentId, paymentIntentId),
  });
  if (!invoice) {
    logger.error("Stripe refund: Invoice not found for PI", { paymentIntentId });
    return;
  }
  logger.info("Stripe payment refunded", { invoiceId: invoice.id, paymentIntentId });

  await db
    .update(invoices)
    .set({ status: "REFUNDED", updatedAt: new Date() })
    .where(eq(invoices.id, invoice.id));

  await db.insert(auditLogs).values({
    userId: invoice.userId,
    action: "PAYMENT_REFUNDED_STRIPE",
    targetType: "INVOICE",
    targetId: invoice.id,
    metadata: JSON.stringify({ paymentIntentId, mode: "TEST MODE" }),
  });
}
