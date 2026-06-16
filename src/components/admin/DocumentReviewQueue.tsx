"use client";

import { useState, useEffect } from "react";
import { reviewDocument } from "@/actions/documents";
import { Check, X, HelpCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Document {
  id: string;
  fileName: string;
  category: string;
  uploadedAt: Date;
  user: {
    name: string | null;
    email: string;
  };
  taxReturn: {
    year: number;
  } | null;
}

export default function DocumentReviewQueue({ initialDocuments }: { initialDocuments: any[] }) {
  const [docs, setDocs] = useState(initialDocuments);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleReview = async (id: string, status: "ACCEPTED" | "REJECTED" | "CLARIFICATION_REQUESTED") => {
    let feedback = "";
    if (status !== "ACCEPTED") {
      feedback = prompt(`Enter feedback for ${status.toLowerCase().replace("_", " ")}:`) || "";
      if (!feedback && status === "REJECTED") return;
    }

    setProcessing(id);
    try {
      await reviewDocument(id, status, feedback);
      setDocs(docs.filter(d => d.id !== id));
    } catch (error) {
      console.error("Failed to review document:", error);
      alert("Error processing review.");
    } finally {
      setProcessing(null);
    }
  };

  if (docs.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-gray-400 font-medium">No documents awaiting review.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 bg-gray-50/50">
        <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
          Document Review Queue
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-white text-left text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              <th className="px-6 py-4">Document</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Year/Category</th>
              <th className="px-6 py-4">Uploaded</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {docs.map((doc) => (
              <tr key={doc.id} className="hover:bg-brand-cloud/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-brand-navy">{doc.fileName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-brand-charcoal">{doc.user?.name || "N/A"}</div>
                  <div className="text-xs text-gray-400">{doc.user?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs font-bold text-brand-navy">{doc.taxReturn?.year || doc.taxYear || "N/A"}</div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{doc.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {format(new Date(doc.uploadedAt), "MMM d, h:mm a")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {processing === doc.id ? (
                    <Loader2 className="animate-spin text-brand-navy ml-auto" size={20} />
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleReview(doc.id, "ACCEPTED")}
                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-colors"
                        title="Accept"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleReview(doc.id, "CLARIFICATION_REQUESTED")}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                        title="Request Clarification"
                      >
                        <HelpCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleReview(doc.id, "REJECTED")}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                        title="Reject"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
