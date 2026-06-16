"use client";

import { useState } from "react";
import { getEngagementLetterDownloadUrl } from "@/actions/engagement";
import { Download, Loader2, FileText } from "lucide-react";

interface DownloadEngagementLetterButtonProps {
  letterId: string;
  className?: string;
}

export function DownloadEngagementLetterButton({ 
  letterId,
  className = ""
}: DownloadEngagementLetterButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const result = await getEngagementLetterDownloadUrl(letterId);
      if (result.url) {
        window.open(result.url, '_blank');
      } else {
        alert(result.error || "Failed to get download link");
      }
    } catch (err) {
      alert("An error occurred while preparing your download.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-brand-black text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <FileText size={16} />
      )}
      Download Signed PDF
    </button>
  );
}
