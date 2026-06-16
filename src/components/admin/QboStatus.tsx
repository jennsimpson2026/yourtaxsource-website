"use client";

import { useState } from "react";
import { syncAllPendingPayments } from "@/actions/admin/qbo-bulk";
import { Zap, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function QboStatus({ qbo }: { qbo: any }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSyncAll = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await syncAllPendingPayments();
      setResult(res);
      if (res.success > 0) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Bulk sync error:", error);
      alert("Failed to run bulk sync");
    } finally {
      setLoading(false);
    }
  };

  if (!qbo) return null;

  return (
    <div className="mt-8 pt-8 border-t border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-brand-black">Sync Operations</h3>
        <button
          onClick={handleSyncAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
          Sync All Pending Payments
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-2xl border ${result.failed > 0 ? "bg-red-50 border-red-100 text-red-700" : "bg-green-50 border-green-100 text-green-700"}`}>
          <div className="flex items-start gap-3">
            {result.failed > 0 ? <AlertCircle size={20} className="shrink-0" /> : <CheckCircle2 size={20} className="shrink-0" />}
            <div>
              <p className="font-bold">Sync Completed</p>
              <p className="text-sm">
                Total: {result.total} | Success: {result.success} | Failed: {result.failed}
              </p>
              {result.errors.length > 0 && (
                <ul className="mt-2 text-xs list-disc ml-4">
                  {result.errors.slice(0, 5).map((err: string, i: number) => (
                    <li key={i}>{err}</li>
                  ))}
                  {result.errors.length > 5 && <li>...and {result.errors.length - 5} more</li>}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
