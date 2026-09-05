"use client";

import { CheckCircle2, Clock, AlertTriangle, XCircle, Loader2 } from "lucide-react";

type VerifyResult = {
  status: string;
  payment_status: string | null;
  paid: boolean;
  expired: boolean;
  asyncPending: boolean;
  error: string | null;
};

interface StripeReturnBannerProps {
  kind: "success" | "cancelled" | "none";
  verify: VerifyResult | null;
}

/**
 * Portal banner shown after returning from Stripe Checkout.
 *
 * The parent (server component) verifies the returned Checkout Session with the
 * Stripe API BEFORE rendering anything here — this component never claims a
 * payment succeeded on its own and never marks invoices paid (that remains the
 * webhook's job). It only renders the outcome Stripe actually reported.
 */
export function StripeReturnBanner({ kind, verify }: StripeReturnBannerProps) {
  if (!verify) {
    return null;
  }

  if (kind === "cancelled") {
    return (
      <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <AlertTriangle className="text-amber-500 shrink-0" size={24} />
        <div>
          <p className="font-bold text-brand-black">Payment cancelled — no charge was made</p>
          <p className="text-sm text-brand-charcoal/70 mt-1">
            You left the Stripe checkout before completing your payment. Your invoice is still unpaid. You can try again at any time.
          </p>
        </div>
      </div>
    );
  }

  if (verify.paid) {
    return (
      <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl p-6">
        <CheckCircle2 className="text-green-600 shrink-0" size={24} />
        <div>
          <p className="font-bold text-brand-black">Payment received</p>
          <p className="text-sm text-brand-charcoal/70 mt-1">
            Stripe has confirmed your payment. Your invoice will update here shortly once processing completes.
          </p>
        </div>
      </div>
    );
  }

  if (verify.asyncPending) {
    return (
      <div className="flex items-start gap-4 bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <Clock className="text-blue-600 shrink-0" size={24} />
        <div>
          <p className="font-bold text-brand-black">Bank draft (ACH) processing</p>
          <p className="text-sm text-brand-charcoal/70 mt-1">
            Stripe says your payment is pending bank clearance. It typically completes within a few business days. We&apos;ll update your invoice once it clears.
          </p>
        </div>
      </div>
    );
  }

  if (verify.expired) {
    return (
      <div className="flex items-start gap-4 bg-red-50 border border-red-200 rounded-2xl p-6">
        <XCircle className="text-red-600 shrink-0" size={24} />
        <div>
          <p className="font-bold text-brand-black">Your payment session expired — nothing was charged</p>
          <p className="text-sm text-brand-charcoal/70 mt-1">
            Stripe reports this Checkout Session as expired with no completed payment. Your invoice remains unpaid. Please start a new payment when you&apos;re ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-6">
      <Loader2 className="text-amber-500 animate-spin shrink-0" size={24} />
      <div>
        <p className="font-bold text-brand-black">Payment status could not be confirmed</p>
        <p className="text-sm text-brand-charcoal/70 mt-1">
          We couldn&apos;t verify this Checkout Session with Stripe. If you were charged, your invoice will update automatically once processing completes.
        </p>
      </div>
    </div>
  );
}