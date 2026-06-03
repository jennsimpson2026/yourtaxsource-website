"use client";

import { AlertCircle, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

interface OpenRequestsProps {
  requests: any[];
}

export function OpenRequests({ requests }: OpenRequestsProps) {
  if (requests.length === 0) return null;

  return (
    <section className="bg-brand-orange/10 rounded-[2rem] p-8 md:p-10 border border-brand-orange/20 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-orange shadow-sm">
          <AlertCircle size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-heading font-bold text-brand-black">Action Needed</h3>
          <p className="text-brand-orange font-bold text-sm">Staff has requested the following information/documents:</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((request) => {
          const metadata = JSON.parse(request.metadata || "{}");
          return (
            <div key={request.id} className="bg-white p-6 rounded-2xl shadow-sm border border-brand-orange/10 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-cloud rounded-xl flex items-center justify-center text-brand-orange">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-bold text-brand-black">{metadata.documentName || "Document Request"}</p>
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
