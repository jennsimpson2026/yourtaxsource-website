import Stripe from "stripe";

/**
 * Stripe integration — STRIPE TEST MODE ONLY.
 *
 * `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` MUST be TEST-mode values
 * (`sk_test_...` / `whsec_...`). This integration must never be pointed at
 * live keys. The account used here is a Stripe Connect platform in test mode.
 */
export const STRIPE_MODE = "TEST MODE";

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY (TEST MODE).");
  }
  if (key.startsWith("sk_live_")) {
    throw new Error("Refusing to use a LIVE Stripe key. This integration is TEST MODE only.");
  }
  return new Stripe(key);
}

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export function validateStripeWebhook(payload: string, signature: string): Stripe.Event {
  const stripe = getStripe();
  if (!WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured (TEST MODE).");
  }
  return stripe.webhooks.constructEvent(payload, signature, WEBHOOK_SECRET);
}

export function surchargeEnabledFor(returnValue: unknown): boolean {
  return Boolean((returnValue as any)?.isSurchargeEnabled);
}
