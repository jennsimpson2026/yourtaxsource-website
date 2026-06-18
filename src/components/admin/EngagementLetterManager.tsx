"use client";

import { useState } from "react";
import { 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Send,
  AlertCircle,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useRouter } from "next/navigation";

export function EngagementLetterManager({ 
  returnId, 
  clientId,
  existingLetter 
}: { 
  returnId: string;
  clientId: string;
  existingLetter?: any;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/workflow/engagement-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnId, action: "generate" }),
      });
      
      if (!res.ok) throw new Error("Failed to generate engagement letter");
      
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
          <FileText className="text-brand-purple" size={20} />
          Engagement Letter
        </h2>
        {existingLetter && (
          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${
            existingLetter.status === 'SIGNED' 
              ? 'bg-green-50 text-green-600 border-green-100' 
              : 'bg-orange-50 text-orange-600 border-orange-100'
          }`}>
            {existingLetter.status}
          </span>
        )}
      </div>

      <div className="p-6 space-y-4">
        {existingLetter ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-brand-purple border border-gray-100">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-navy">Professional Services Agreement</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {existingLetter.status === 'SIGNED' 
                      ? `Signed on ${new Date(existingLetter.signedAt!).toLocaleDateString()}` 
                      : 'Awaiting Client Signature'}
                  </p>
                </div>
              </div>
              {existingLetter.status === 'SIGNED' ? (
                <div className="text-green-500">
                  <CheckCircle2 size={20} />
                </div>
              ) : (
                <div className="text-orange-500">
                  <Clock size={20} className="animate-pulse" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleGenerate}
                disabled={loading || existingLetter.status === 'SIGNED'}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-brand-navy rounded-xl text-xs font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Regenerate
              </button>
              <a 
                href={`/portal/engagement-letter?id=${existingLetter.id}`}
                target="_blank"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-purple text-white rounded-xl text-xs font-bold hover:bg-opacity-90 transition-all"
              >
                <ExternalLink size={14} />
                Preview
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-brand-navy">No Letter Found</p>
              <p className="text-xs text-gray-400 px-4">This return doesn't have an engagement letter associated with it yet.</p>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-purple text-white rounded-xl text-sm font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-brand-purple/10"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Generate & Send to Client
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg border border-red-100">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
