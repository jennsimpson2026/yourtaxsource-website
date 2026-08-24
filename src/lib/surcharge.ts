/**
 * Compliant 'Credit Card Surcharge' logic.
 *
 * Rules (STRIPE TEST MODE):
 *  - Never surcharge debit or prepaid cards.
 *  - Surcharge is capped at the LOWER of 3% (legal cap) or the actual
 *    processing cost, so the firm does not profit from the surcharge.
 *  - Standardized terminology everywhere: 'Credit Card Surcharge' /
 *    'Card Processing Surcharge'.
 */
export const SURCHARGE_CAP_RATE = 0.03; // 3% legal cap
export const SURCHARGE_LABEL = "Credit Card Surcharge";
export const SURCHARGE_ALT_LABEL = "Card Processing Surcharge";

export type CardFunding = "credit" | "debit" | "prepaid" | "unknown";

/**
 * Normalize Stripe's `payment_method.card.funding` value.
 * Debit and prepaid are never surcharged.
 */
export function getCardFunding(funding: string | null | undefined): CardFunding {
  if (funding === "credit" || funding === "debit" || funding === "prepaid" || funding === "unknown") {
    return funding;
  }
  return "unknown";
}

/** Modeled actual processing cost in cents (configurable via env). */
export function getActualProcessingCost(amountCents: number): number {
  const rate = parseFloat(process.env.CARD_PROCESSING_COST_RATE ?? "0.028");
  const flatCents = parseFloat(process.env.CARD_PROCESSING_COST_FLAT_CENTS ?? "30");
  return amountCents * rate + flatCents;
}

/**
 * Compute the 'Credit Card Surcharge' in cents for a base amount (in cents).
 * Returns 0 when the funding source is debit/prepaid, or when the resulting
 * surcharge would be non-positive. Capped at the lower of 3% or actual cost.
 */
export function computeCreditCardSurcharge(
  amountCents: number,
  options?: { funding?: string | null }
): number {
  const funding = getCardFunding(options?.funding);

  // Never surcharge debit or prepaid cards.
  if (funding === "debit" || funding === "prepaid") {
    return 0;
  }

  if (amountCents <= 0) return 0;

  const actualCost = getActualProcessingCost(amountCents);
  const capAmount = Math.round(amountCents * SURCHARGE_CAP_RATE);

  // Lower of 3% cap or actual cost. Round to whole cents, never negative.
  const allowed = Math.max(0, Math.round(Math.min(capAmount, actualCost)));
  return allowed;
}

/** Returns the standard user-facing label for a card surcharge. */
export function surchargeLabelFor(_isCredit: boolean): string {
  return SURCHARGE_LABEL;
}
