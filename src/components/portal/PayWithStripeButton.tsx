"use client";

import { useState } from "react";
import { createStripeCheckoutSession } from "@/actions/stripe";
import { Loader2, CreditCard } from "lucide-react";

interface PayWithStripeButtonProps {
  invoiceId: string;
  className?: string;
}

/**
 * Pay with Stripe (ACH preferred / card second) — STRIPE TEST MODE.
 * A 'Credit Card Surcharge' may apply when paying by credit card; debit,
 * prepaid, and ACH are never surcharged.
 */
export function PayWithStripeButton({ invoiceId, className = "" }: PayWithStripeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const { url } = await createStripeCheckoutSession(invoiceId);
      if (url) {
        window.location.href = url;
      } else {
        alert("Failed to generate payment link.");
      }
    } catch (error: any) {
      console.error("Error initiating Stripe payment:", error);
      alert(error?.message || "Failed to initiate Stripe payment session (TEST MODE).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className={`bg-brand-purple text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 ${className}`}
    >
      {loading ? <Loader2 className="animate-spin" size={20} /> : <CreditCard size={20} />}
      {loading ? "Redirecting…" : "Pay Securely with Stripe"}
    </button>
  );
}
