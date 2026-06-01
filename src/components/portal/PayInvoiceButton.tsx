"use client";

import { useState } from "react";
import { initializePaymentSession } from "@/actions/invoices";
import { Loader2, CreditCard } from "lucide-react";
import Script from "next/script";

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
      const { checkoutToken } = await initializePaymentSession(invoiceId);

      if (window.helcimPay) {
        window.helcimPay.append({
          checkoutToken,
          onSuccess: (data: any) => {
            console.log("Payment successful", data);
            // The webhook will update the database, but we can also revalidate here
            window.location.reload();
          },
          onError: (error: any) => {
            console.error("Payment failed", error);
            alert("Payment failed. Please try again.");
          },
        });
      } else {
        alert("Helcim Pay SDK not loaded. Please refresh the page.");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to initiate payment session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://secure.helcim.com/helcim-pay/v1/sdk.js"
        strategy="lazyOnload"
      />
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
        Pay Now
      </button>
    </>
  );
}
