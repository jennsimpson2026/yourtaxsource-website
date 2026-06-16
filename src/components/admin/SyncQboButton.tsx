"use client";

import { useState } from "react";
import { RefreshCw, Loader2, Check } from "lucide-react";

export function SyncQboButton() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/workflows/trigger-sync", {
        method: "POST",
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Failed to trigger sync");
      }
    } catch (error) {
      console.error("Sync error:", error);
      alert("Error triggering sync");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all ${
        success 
          ? "bg-green-500 text-white" 
          : "bg-brand-navy text-white hover:bg-brand-navy/90"
      }`}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : success ? (
        <Check size={16} />
      ) : (
        <RefreshCw size={16} />
      )}
      {loading ? "Triggering..." : success ? "Started!" : "Sync All Clients to QBO"}
    </button>
  );
}
