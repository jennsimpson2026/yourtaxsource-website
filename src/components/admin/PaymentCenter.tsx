"use client";

import { useState } from "react";
import { 
  CreditCard, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Trash2,
  DollarSign,
  Zap,
  Lock,
  Unlock,
  Settings,
  Banknote,
  MinusCircle
} from "lucide-react";
import { 
  toggleManualRelease, 
  toggleSurcharge, 
  applyFeeAdjustment, 
  recordManualPayment,
  createOneOffInvoice
} from "@/actions/admin-payments";
import { deleteInvoice } from "@/actions/invoices";
import { toast } from "sonner";

interface PaymentCenterProps {
  returnId: string;
  taxPrepFee: number;
  waivedAmount: number;
  paymentStatus: string;
  manualRelease: boolean;
  isSurchargeEnabled: boolean;
  existingInvoices: any[];
  auditLogs?: any[];
}

export function PaymentCenter({ 
  returnId, 
  taxPrepFee, 
  waivedAmount,
  paymentStatus, 
  manualRelease: initialManualRelease,
  isSurchargeEnabled: initialSurchargeEnabled,
  existingInvoices,
  auditLogs = []
}: PaymentCenterProps) {
  const [loading, setLoading] = useState(false);
  const [showInvoiceForm, setShowForm] = useState(false);
  const [showManualPaymentForm, setShowManualPaymentForm] = useState(false);
  const [manualRelease, setManualRelease] = useState(initialManualRelease);
  const [surchargeEnabled, setSurchargeEnabled] = useState(initialSurchargeEnabled);
  const [applyDeposit, setApplyDeposit] = useState(false);

  // Form states
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [manualPayAmount, setManualPayAmount] = useState("");
  const [manualPayMethod, setManualPayMethod] = useState("CHECK");

  const totalPaid = existingInvoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);
  
  const adjustedFee = Math.max(0, taxPrepFee - waivedAmount);
  const balanceDue = Math.max(0, adjustedFee - totalPaid);

  const handleToggleManualRelease = async () => {
    setLoading(true);
    try {
      const nextValue = !manualRelease;
      await toggleManualRelease(returnId, nextValue);
      setManualRelease(nextValue);
      toast.success(`Manual release ${nextValue ? 'enabled' : 'disabled'}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to toggle manual release");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSurcharge = async () => {
    setLoading(true);
    try {
      const nextValue = !surchargeEnabled;
      await toggleSurcharge(returnId, nextValue);
      setSurchargeEnabled(nextValue);
      toast.success(`Surcharge ${nextValue ? 'enabled' : 'disabled'}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to toggle surcharge");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentAmount) return;
    setLoading(true);
    try {
      await applyFeeAdjustment(returnId, Number(adjustmentAmount), adjustmentReason || "Admin Adjustment");
      setAdjustmentAmount("");
      setAdjustmentReason("");
      toast.success("Adjustment applied successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to apply adjustment");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPayAmount) return;
    setLoading(true);
    try {
      await recordManualPayment(returnId, Number(manualPayAmount), manualPayMethod);
      setManualPayAmount("");
      setShowManualPaymentForm(false);
      toast.success(`Payment of ${manualPayAmount} recorded`);
    } catch (e: any) {
      toast.error(e.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!invoiceAmount) return;
    setLoading(true);
    try {
      await createOneOffInvoice(returnId, Number(invoiceAmount));
      setInvoiceAmount("");
      setShowForm(false);
      toast.success(`Invoice for ${invoiceAmount} generated`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    setLoading(true);
    try {
      await deleteInvoice(id);
      toast.success("Invoice deleted");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBookingDeposit = async () => {
    setLoading(true);
    try {
      await applyFeeAdjustment(returnId, 25, "Booking Deposit Credit");
      setApplyDeposit(true);
      toast.success("Booking deposit applied");
    } catch (e: any) {
      toast.error(e.message || "Failed to apply deposit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-purple/10 rounded-2xl flex items-center justify-center text-brand-purple">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-brand-navy">Payment Center</h2>
            <p className="text-xs text-brand-charcoal/40 font-bold uppercase tracking-widest">Financial Management</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Balance Due</p>
          <p className={`text-2xl font-black ${balanceDue > 0 ? 'text-brand-orange' : 'text-green-600'}`}>
            ${balanceDue.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Master Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manual Release Toggle */}
          <div className="p-5 rounded-2xl bg-brand-cloud border border-gray-100 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${manualRelease ? 'bg-green-100 text-green-600' : 'bg-brand-soft-gray text-brand-charcoal/40'}`}>
                {manualRelease ? <Unlock size={20} /> : <Lock size={20} />}
              </div>
              <div>
                <p className="text-sm font-bold text-brand-navy">Document Release</p>
                <p className="text-[10px] text-brand-charcoal/40 font-medium">Allow download before payment</p>
              </div>
            </div>
            <button 
              onClick={handleToggleManualRelease}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${manualRelease ? 'bg-brand-purple' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${manualRelease ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Surcharge Toggle */}
          <div className="p-5 rounded-2xl bg-brand-cloud border border-gray-100 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${surchargeEnabled ? 'bg-brand-orange/10 text-brand-orange' : 'bg-brand-soft-gray text-brand-charcoal/40'}`}>
                <Settings size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-navy">Card Surcharge</p>
                <p className="text-[10px] text-brand-charcoal/40 font-medium">3% Credit Card Processing Fee</p>
              </div>
            </div>
            <button 
              onClick={handleToggleSurcharge}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${surchargeEnabled ? 'bg-brand-orange' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${surchargeEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Deposit & Quick Adjustments */}
        <div className="space-y-4">
           <h3 className="text-xs font-black text-brand-navy uppercase tracking-widest flex items-center gap-2">
            <Zap size={14} className="text-brand-orange" />
            Quick Adjustments
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Apply Deposit */}
              <button 
                onClick={handleApplyBookingDeposit}
                disabled={applyDeposit || loading}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${applyDeposit ? 'bg-brand-purple border-brand-purple text-white' : 'bg-white border-gray-100 text-brand-navy hover:border-brand-purple/30'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${applyDeposit ? 'bg-white/20' : 'bg-brand-soft-gray'}`}>
                  <DollarSign size={16} />
                </div>
                <p className="text-xs font-bold">Booking Deposit</p>
                <p className={`text-[10px] ${applyDeposit ? 'text-white/70' : 'text-gray-400'}`}>Apply $25.00 Credit</p>
              </button>

              {/* Waived Amounts / Discount Form Trigger */}
              <div className="md:col-span-2 p-4 rounded-xl border border-gray-100 bg-white">
                <form onSubmit={handleApplyAdjustment} className="flex gap-4 h-full items-end">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discount Amount ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xs">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={adjustmentAmount}
                        onChange={(e) => setAdjustmentAmount(e.target.value)}
                        className="w-full bg-brand-soft-gray border-none rounded-lg p-2 pl-7 text-xs focus:ring-1 focus:ring-brand-purple"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex-[2] space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reason / Note</label>
                    <input 
                      type="text" 
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      className="w-full bg-brand-soft-gray border-none rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-purple"
                      placeholder="e.g. Referral Discount"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!adjustmentAmount || loading}
                    className="p-2.5 bg-brand-navy text-white rounded-lg hover:bg-brand-navy/90 disabled:opacity-30 transition-all"
                  >
                    <MinusCircle size={18} />
                  </button>
                </form>
              </div>
           </div>
        </div>

        {/* Manual Payment Entry */}
        <div className="space-y-4 pt-4 border-t border-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-brand-navy uppercase tracking-widest flex items-center gap-2">
              <Banknote size={14} className="text-brand-orange" />
              Manual Payment Entry
            </h3>
            <button 
              onClick={() => setShowManualPaymentForm(!showManualPaymentForm)}
              className="text-[10px] font-black text-brand-purple uppercase hover:underline"
            >
              {showManualPaymentForm ? "Close" : "Record Offline Payment"}
            </button>
          </div>

          {showManualPaymentForm && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <form onSubmit={handleRecordManualPayment} className="bg-brand-cloud p-6 rounded-2xl border border-brand-purple/10 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={manualPayAmount}
                        onChange={(e) => setManualPayAmount(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 pl-8 text-sm focus:ring-2 focus:ring-brand-purple/20 outline-none"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Method</label>
                    <select 
                      value={manualPayMethod}
                      onChange={(e) => setManualPayMethod(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-purple/20 outline-none appearance-none cursor-pointer"
                    >
                      <option value="CHECK">Check</option>
                      <option value="CASH">Cash</option>
                      <option value="ZELLE">Zelle</option>
                      <option value="VENMO">Venmo</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-navy text-white font-black py-3 rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "RECORD PAYMENT"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Invoice Summary */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-brand-navy uppercase tracking-widest flex items-center gap-2">
              <RefreshCw size={14} className="text-brand-orange" />
              Active Invoices
            </h3>
            <button 
              onClick={() => setShowForm(!showInvoiceForm)}
              className="p-2 bg-brand-purple/5 text-brand-purple rounded-lg hover:bg-brand-purple/10 transition-colors"
              title="Create New Invoice"
            >
              <Plus size={16} />
            </button>
          </div>

          {showInvoiceForm && (
            <div className="p-4 bg-brand-soft-gray rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-1">
               <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">New Invoice Amount ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 pl-7 text-xs"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleGenerateInvoice}
                    disabled={loading || !invoiceAmount}
                    className="bg-brand-purple text-white px-4 py-2 rounded-lg text-xs font-black shadow-md hover:bg-opacity-90 disabled:opacity-30 transition-all"
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : "GENERATE"}
                  </button>
               </div>
            </div>
          )}

          <div className="space-y-2">
            {existingInvoices.length > 0 ? (
              existingInvoices.map((invoice) => (
                <div key={invoice.id} className="p-4 rounded-2xl border border-gray-50 bg-white flex items-center justify-between group hover:border-brand-purple/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      invoice.status === 'PAID' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-400'
                    }`}>
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-brand-navy">${Number(invoice.amount).toFixed(2)}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        #{invoice.id.slice(0, 8)} • {new Date(invoice.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {invoice.status === 'PAID' ? (
                      <span className="text-[10px] font-black text-green-600 uppercase bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">
                        <CheckCircle2 size={12} /> Paid
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-red-500 uppercase bg-red-50 px-2 py-1 rounded-md flex items-center gap-1">
                        <AlertCircle size={12} /> Unpaid
                      </span>
                    )}
                    <button 
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      disabled={loading}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-brand-cloud rounded-2xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-medium italic">No active invoices found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction & Adjustment History */}
      <div className="px-8 pb-8 space-y-4">
        <h3 className="text-xs font-black text-brand-navy uppercase tracking-widest flex items-center gap-2">
          <Clock size={14} className="text-brand-orange" />
          Financial History
        </h3>
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {auditLogs.filter(log => ['PAYMENT_RECORDED', 'ADJUSTMENT_APPLIED', 'DEPOSIT_APPLIED', 'MANUAL_RELEASE_TOGGLED'].includes(log.action)).length > 0 ? (
            auditLogs
              .filter(log => ['PAYMENT_RECORDED', 'ADJUSTMENT_APPLIED', 'DEPOSIT_APPLIED', 'MANUAL_RELEASE_TOGGLED'].includes(log.action))
              .map((log, idx) => (
                <div key={idx} className="text-[10px] p-3 rounded-lg bg-gray-50 border border-gray-100 flex justify-between items-start">
                  <div>
                    <p className="font-bold text-brand-navy uppercase tracking-tight">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-gray-500 mt-0.5">{log.details}</p>
                  </div>
                  <p className="text-gray-300 font-medium whitespace-nowrap ml-4">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
          ) : (
            <div className="text-center py-4 bg-brand-cloud rounded-xl border border-dashed border-gray-100">
              <p className="text-[10px] text-gray-400 font-medium italic">No financial history yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-brand-navy text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] text-center border-t border-white/5">
        <ShieldCheck size={12} className="inline mr-2 text-brand-orange" />
        Boutique Advisory Secure Financial System
      </div>
    </div>
  );
}
