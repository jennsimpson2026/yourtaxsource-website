"use client";

import { useState } from "react";
import { initializePaymentSession } from "@/actions/invoices";
import { Loader2, CreditCard } from "lucide-react";

interface PayInvoiceButtonProps {
  invoiceId: string;
}

declare global {
  interface Window {
    helcimPay: any;
  }
}

export function PayInvoiceButton({ invoiceId }: PayInvoiceButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const { paymentUrl } = await initializePaymentSession(invoiceId);

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert("Failed to generate payment link.");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to initiate payment session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="bg-brand-purple text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <CreditCard size={20} />
      )}
      Pay Securely with Intuit
    </button>
  );
}
