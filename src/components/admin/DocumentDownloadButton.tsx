"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { getDownloadUrl } from "@/actions/documents";

export function DocumentDownloadButton({ documentId }: { documentId: string }) {
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
