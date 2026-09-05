"use server";

import Stripe from "stripe";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import { computeCreditCardSurcharge, surchargeLabelFor } from "@/lib/surcharge";

/**
 * Create a Stripe Checkout session for an invoice — STRIPE TEST MODE ONLY.
 *
 * - ACH (bank draft) is the preferred/first payment method; card is second.
 * - When a surcharge is enabled on the return, a 'Credit Card Surcharge'
 *   line item is added. Because the customer's eventual card funding is only
 *   known after entry, the checkout assumes a credit card; the webhook then
 *   enforces the 'never surcharge debit/prepaid' rule on the actual funding
 *   and records the true surcharge (0 for debit/prepaid).
 */
export async function createStripeCheckoutSession(invoiceId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as any).id;

  const invoice = await db.query.invoices.findFirst({
    where: and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)),
    with: {
      user: true,
      taxReturn: true,
    },
  });

  if (!invoice) {
    logger.error("Stripe session creation failed: Invoice not found", { invoiceId, userId });
    throw new Error("Invoice not found");
  }
  if (invoice.status === "PAID") {
    logger.warn("Stripe session creation attempted for already paid invoice", { invoiceId, userId });
    throw new Error("Invoice already paid");
  }

  const stripe = getStripe();
  const currency = invoice.currency.toLowerCase();
  const baseAmountCents = Math.round(Number(invoice.amount) * 100);
  const surchargeEnabled = Boolean((invoice.taxReturn as any)?.isSurchargeEnabled);
  // Assume credit at checkout; webhook corrects for actual funding.
  const surchargeCents = surchargeEnabled
    ? computeCreditCardSurcharge(baseAmountCents, { funding: "credit" })
    : 0;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        currency,
        unit_amount: baseAmountCents,
        product_data: {
          name: `Tax Preparation Services — Invoice #${invoice.id.slice(0, 8)}`,
        },
      },
      quantity: 1,
    },
  ];

  if (surchargeCents > 0) {
    lineItems.push({
      price_data: {
        currency,
        unit_amount: surchargeCents,
        product_data: {
          name: `${surchargeLabelFor(true)} (capped at 3%, reflects actual processing cost)`,
        },
      },
      quantity: 1,
    });
  }

  const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: invoice.user?.email || undefined,
    line_items: lineItems,
    metadata: { invoiceId: invoice.id },
    // ACH (bank draft) is the preferred / first option; card is second.
    payment_method_types: ["us_bank_account", "card"],
    payment_method_options: {
      us_bank_account: {
        financial_connections: { permissions: ["payment_method", "balances"] },
      },
    },
    success_url: `${origin}/portal?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/portal?stripe=cancelled`,
  });

  logger.info("Stripe Checkout session created", {
    invoiceId: invoice.id,
    sessionId: checkout.id,
    amount: baseAmountCents,
    surcharge: surchargeCents,
    mode: "TEST",
  });

  return { url: checkout.url, mode: "TEST MODE" };
}

/**
 * Verify a Stripe Checkout Session returned via the success_url and return its
 * true payment state. This is the ONLY thing the portal success page may rely on
 * to show a "paid" state — it is read directly from Stripe, never from client
 * claims or from our own DB (which is updated exclusively by the webhook).
 *
 * Returns a normalized, PII-safe result:
 *  - status: session.status ('open' | 'complete' | 'expired' | 'unknown')
 *  - payment_status: session.payment_status when available
 *  - paid: true only when Stripe says payment_status === 'paid' (card captured)
 *    or 'no_payment_required' (nothing owed). For async (ACH/bank) payments the
 *    session often remains payment_status 'unpaid' until the bank draft clears;
 *    we surface that distinctly as a pending state, never as success.
 *  - expired: true when Stripe says status === 'expired'
 */
export async function verifyStripeCheckoutSession(sessionId: string) {
  const stripe = getStripe();
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err: any) {
    logger.error("Stripe Checkout session verify failed", {
      sessionId,
      error: err?.message,
    });
    return {
      status: "unknown",
      payment_status: null,
      paid: false,
      expired: false,
      asyncPending: false,
      error: "Could not verify Checkout Session",
    };
  }

  const status = session.status ?? "unknown";
  const paymentStatus = session.payment_status ?? null;
  const paid =
    paymentStatus === "paid" || paymentStatus === "no_payment_required";
  const expired = status === "expired";
  const asyncPending =
    status === "complete" && paymentStatus === "unpaid"; // ACH / bank draft still clearing

  logger.info("Stripe Checkout session verified", {
    sessionId: session.id,
    status,
    payment_status: paymentStatus,
    paid,
    expired,
    asyncPending,
    mode: "TEST",
  });

  return {
    status,
    payment_status: paymentStatus,
    paid,
    expired,
    asyncPending,
    error: null,
  };
}
