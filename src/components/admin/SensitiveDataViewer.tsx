"use client";

import { useState } from "react";
import { getSensitiveClientData } from "@/actions/admin";
import { Eye, EyeOff, ShieldAlert, Loader2, Landmark, Users } from "lucide-react";

export function SensitiveDataViewer({ clientId }: { clientId: string }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleToggle = async () => {
    if (!show && !data) {
      setIsLoading(true);
      try {
        const sensitiveData = await getSensitiveClientData(clientId);
        setData(sensitiveData);
        setShow(true);
      } catch (error) {
        console.error("Error fetching sensitive data:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setShow(!show);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-brand-navy/10 overflow-hidden">
      <div className="p-6 border-b border-brand-navy/5 bg-brand-cloud flex justify-between items-center">
        <h2 className="text-lg font-heading font-bold text-brand-navy flex items-center gap-2">
          <ShieldAlert className="text-brand-orange" size={20} />
          Sensitive Information
        </h2>
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-brand-navy text-white hover:bg-brand-navy/90 transition-all shadow-sm disabled:opacity-50 active:scale-95"
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : show ? (
            <EyeOff size={14} />
          ) : (
            <Eye size={14} />
          )}
          {show ? "Hide Sensitive Data" : "Reveal Sensitive Data"}
        </button>
      </div>

      {show && data && (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* SSN */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-navy font-bold text-sm">
                <Users size={18} className="text-brand-orange" />
                Social Security Number
              </div>
              <div className="p-4 bg-brand-soft-gray rounded-xl border border-gray-100 font-mono text-lg text-brand-navy tracking-widest">
                {data.ssn || "Not Provided"}
              </div>
            </div>

            {/* Banking */}
            {data.banking && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-navy font-bold text-sm">
                  <Landmark size={18} className="text-brand-orange" />
                  Banking Details
                </div>
                <div className="p-4 bg-brand-soft-gray rounded-xl border border-gray-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Bank Name</span>
                    <span className="text-sm font-bold text-brand-navy">{data.banking.bankName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Routing #</span>
                    <span className="text-sm font-bold text-brand-navy">{data.banking.routingNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Account #</span>
                    <span className="text-sm font-mono font-bold text-brand-navy">{data.banking.accountNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Type</span>
                    <span className="text-sm font-bold text-brand-navy">{data.banking.accountType || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dependents */}
          {data.dependents && data.dependents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-navy font-bold text-sm border-t border-gray-100 pt-6">
                <Users size={18} className="text-brand-orange" />
                Dependents Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.dependents.map((dep: any, idx: number) => (
                  <div key={idx} className="p-4 bg-brand-soft-gray rounded-xl border border-gray-100 space-y-1">
                    <div className="font-bold text-brand-navy text-sm">{dep.name}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">SSN</span>
                      <span className="text-xs font-mono font-bold text-brand-navy">{dep.ssn}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Relationship</span>
                      <span className="text-xs font-medium text-brand-charcoal/60">{dep.relationship}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-brand-orange/5 border border-brand-orange/10 rounded-xl flex items-start gap-3">
            <ShieldAlert size={18} className="text-brand-orange shrink-0 mt-0.5" />
            <p className="text-xs text-brand-navy/70 font-medium leading-relaxed">
              <strong>Compliance Notice:</strong> This action has been logged in the secure audit trail. Access to PII is restricted to authorized personnel only. Do not store or share this information outside of the secure portal.
            </p>
          </div>
        </div>
      )}

      {!show && (
        <div className="p-12 text-center bg-gray-50/30">
          <p className="text-sm text-gray-400 font-medium italic">Click the reveal button above to view secure information.</p>
        </div>
      )}
    </div>
  );
}
