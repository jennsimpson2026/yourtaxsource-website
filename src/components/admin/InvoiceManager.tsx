"use client";

import { useState } from "react";
import { createInvoice } from "@/actions/invoices";
import { manualSyncInvoice } from "@/actions/admin/qbo";
import { CreditCard, Plus, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface InvoiceManagerProps {
  returnId: string;
  existingInvoices: any[];
}

export function InvoiceManager({ returnId, existingInvoices }: InvoiceManagerProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    setLoading(true);
    try {
      await createInvoice(returnId, Number(amount));
      setAmount("");
      setShowForm(false);
      // We rely on revalidatePath in the action to update the UI
      window.location.reload(); 
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice.");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToQbo = async (invoiceId: string) => {
    setLoading(true);
    try {
      const result = await manualSyncInvoice(invoiceId);
      if (result.success) {
        alert("Successfully synced to QuickBooks!");
        window.location.reload();
      } else {
        alert("Sync failed: " + result.error);
      }
    } catch (error) {
      console.error("QBO Sync Error:", error);
      alert("An unexpected error occurred during sync.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
          <CreditCard className="text-brand-orange" size={20} />
          Invoices & Payments
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-bold text-brand-orange hover:text-orange-600 flex items-center gap-1 transition-colors uppercase tracking-widest"
        >
          {showForm ? "Cancel" : <><Plus size={14} /> Create Invoice</>}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {showForm && (
          <form onSubmit={handleCreateInvoice} className="bg-brand-cloud p-6 rounded-xl border border-gray-100 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Invoice Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-gray-200 p-3 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-navy text-white font-black py-3 rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "GENERATE INVOICE"}
            </button>
          </form>
        )}

        <div className="space-y-3">
          {existingInvoices.length > 0 ? (
            existingInvoices.map((invoice) => (
              <div key={invoice.id} className="p-4 rounded-xl border border-gray-50 bg-white flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    invoice.status === 'PAID' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-400'
                  }`}>
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-navy">${Number(invoice.amount).toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      #{invoice.id.slice(0, 8)} • {new Date(invoice.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {invoice.qboSalesReceiptId && (
                    <span className="flex items-center gap-1 text-[10px] font-black text-brand-purple uppercase bg-brand-lavender/30 px-2 py-1 rounded-md" title={`QBO ID: ${invoice.qboSalesReceiptId}`}>
                      QBO Synced
                    </span>
                  )}
                  {invoice.status === 'PAID' && !invoice.qboSalesReceiptId && (
                    <button
                      onClick={() => handleSyncToQbo(invoice.id)}
                      disabled={loading}
                      className="flex items-center gap-1 text-[10px] font-black text-brand-navy hover:text-brand-purple uppercase bg-gray-100 hover:bg-brand-lavender/20 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                    >
                      <RefreshCw size={10} className={loading ? "animate-spin" : ""} /> Sync QBO
                    </button>
                  )}
                  {invoice.status === 'PAID' ? (
                    <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase bg-green-50 px-2 py-1 rounded-md">
                      <CheckCircle2 size={12} /> Paid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase bg-red-50 px-2 py-1 rounded-md">
                      <AlertCircle size={12} /> Unpaid
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm italic font-medium">
              No invoices generated for this return.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
