"use client";

import { getDownloadUrl, softDeleteDocument } from "@/actions/documents";
import { FileText, Lock, Download, Trash2, Clock, Loader2 } from "lucide-react";
import { useState } from "react";

interface Document {
  id: string;
  fileName: string;
  category: string;
  uploadedAt: Date;
  isLocked: boolean;
  status: string;
  reviewFeedback: string | null;
}

export function DocumentList({ documents }: { documents: Document[] }) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">Accepted</span>;
      case "REJECTED":
        return <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase">Rejected</span>;
      case "CLARIFICATION_REQUESTED":
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">Action Needed</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-full text-[10px] font-black uppercase">Pending Review</span>;
    }
  };

  async function handleDownload(docId: string) {
    setDownloading(docId);
    try {
      const url = await getDownloadUrl(docId);
      window.open(url, "_blank");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error downloading document");
    } finally {
      setDownloading(null);
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Are you sure you want to delete this document? It will be permanently removed after 30 days.")) {
      return;
    }
    try {
      await softDeleteDocument(docId);
    } catch (error) {
      console.error(error);
      alert("Error deleting document");
    }
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-brand-charcoal/40 uppercase tracking-wider">Document</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-brand-charcoal/40 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-brand-charcoal/40 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-brand-charcoal/40 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-brand-cloud/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-soft-gray rounded-xl flex items-center justify-center text-brand-charcoal/40">
                      <FileText size={20} />
                    </div>
                    <span className="text-sm font-bold text-brand-black">{doc.fileName}</span>
                    <div className="flex items-center gap-2 ml-2">
                      {getStatusBadge(doc.status)}
                      {doc.isLocked && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase">
                          <Lock size={10} />
                          Locked
                        </div>
                      )}
                    </div>
                  </div>
                  {doc.reviewFeedback && (
                    <p className="text-[10px] text-red-500 mt-1 font-medium italic">
                      Note: {doc.reviewFeedback}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-medium px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {doc.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-charcoal/60">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {doc.isLocked ? (
                      <button
                        onClick={() => alert("This final return is locked until your tax preparation fee is paid. Please visit the Payments section on your dashboard.")}
                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Locked - Payment Required"
                      >
                        <Lock size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDownload(doc.id)}
                        disabled={downloading === doc.id}
                        className="p-2 text-brand-purple hover:bg-brand-lavender rounded-lg transition-colors disabled:opacity-50"
                        title="Download"
                      >
                        {downloading === doc.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Download size={18} />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                      <FileText size={32} />
                    </div>
                    <p className="text-brand-charcoal/40 text-sm font-medium">No documents found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
