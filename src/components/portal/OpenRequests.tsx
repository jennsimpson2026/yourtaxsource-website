"use client";

import { AlertCircle, FileText, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";

interface OpenRequestsProps {
  requests: any[];
  unpaidInvoices?: any[];
}

export function OpenRequests({ requests, unpaidInvoices = [] }: OpenRequestsProps) {
  if (requests.length === 0 && unpaidInvoices.length === 0) return null;

  return (
    <section className="bg-brand-orange/10 rounded-[2rem] p-8 md:p-10 border border-brand-orange/20 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-orange shadow-sm">
          <AlertCircle size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-heading font-bold text-brand-black">Action Needed</h3>
          <p className="text-brand-orange font-bold text-sm">Please complete the following items to proceed:</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unpaid Invoices */}
        {unpaidInvoices.map((invoice) => (
          <div key={invoice.id} className="bg-white p-6 rounded-2xl shadow-sm border border-brand-orange/10 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-soft-gray rounded-xl flex items-center justify-center text-brand-orange">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="font-bold text-brand-black">
                  Payment Needed: ${Number(invoice.amount).toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Invoice #{invoice.id.slice(0, 8)}
                </p>
              </div>
            </div>
            <Link 
              href="#invoices"
              className="text-brand-orange hover:translate-x-1 transition-transform"
            >
              <ArrowRight size={20} />
            </Link>
          </div>
        ))}

        {/* Document Requests */}
        {requests.map((request) => {
          const metadata = JSON.parse(request.metadata || "{}");
          return (
            <div key={request.id} className="bg-white p-6 rounded-2xl shadow-sm border border-brand-orange/10 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-soft-gray rounded-xl flex items-center justify-center text-brand-orange">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-bold text-brand-black">
                    {metadata.documentName || metadata.documentList || "Document Request"}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Requested on {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Link 
                href="/portal/documents"
                className="text-brand-orange hover:translate-x-1 transition-transform"
              >
                <ArrowRight size={20} />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
