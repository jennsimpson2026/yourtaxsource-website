"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { softDeleteDocument } from "@/actions/documents";
import { useRouter } from "next/navigation";

export function DocumentDeleteButton({ 
  documentId, 
  fileName 
}: { 
  documentId: string;
  fileName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    setLoading(true);
    try {
      await softDeleteDocument(documentId);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
      title="Delete Document"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
    </button>
  );
}
