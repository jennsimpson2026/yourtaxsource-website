"use client";

import { getDownloadUrl } from "@/actions/documents";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

interface FinalReturnDownloadButtonProps {
  documentId: string;
  fileName?: string;
}

/**
 * Client button that downloads a released final-return document using the
 * same secure mechanism as DocumentList (server action getDownloadUrl →
 * presigned S3 URL → window.open). Only intended to be shown when the
 * document is already unlocked (documentsReleased).
 */
export function FinalReturnDownloadButton({
  documentId,
  fileName = "Final Return",
}: FinalReturnDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const url = await getDownloadUrl(documentId);
      window.open(url, "_blank");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error downloading document");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-lg shadow-brand-purple/20 disabled:opacity-50"
    >
      {downloading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      Download Final Return
    </button>
  );
}