"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { getDownloadUrl } from "@/actions/documents";

export function DocumentDownloadButton({ 
  documentId, 
  showLabel = false,
  fileName,
  category,
  fileSize
}: { 
  documentId: string;
  showLabel?: boolean;
  fileName?: string;
  category?: string;
  fileSize?: number;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDownload() {
    setIsLoading(true);
    try {
      const url = await getDownloadUrl(documentId);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Failed to get download URL", error);
      alert("Failed to download document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (showLabel) {
    return (
      <div className="flex flex-col">
        <button 
          onClick={handleDownload}
          disabled={isLoading}
          className="text-left group/btn"
        >
          <p className="text-sm font-bold text-brand-navy group-hover/btn:text-brand-orange transition-colors line-clamp-1">
            {fileName}
            {isLoading && <Loader2 size={12} className="inline ml-2 animate-spin text-brand-purple" />}
            {category === "ADMIN_ONLY" && (
              <span className="ml-2 px-1.5 py-0.5 bg-brand-purple/10 text-brand-purple text-[8px] font-black uppercase rounded-md border border-brand-purple/20">
                Admin Only
              </span>
            )}
          </p>
          {category && fileSize && (
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {category} • {(fileSize / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleDownload}
      disabled={isLoading}
      className="p-2 text-brand-charcoal/40 hover:text-brand-navy transition-colors disabled:opacity-50" 
      title="Download"
    >
      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
    </button>
  );
}
