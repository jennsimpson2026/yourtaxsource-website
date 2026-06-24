"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Trash2, HelpCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Workflow {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  error?: string;
}

export const WorkflowStatus = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch("/api/admin/workflows");
      const data = await res.json();
      setWorkflows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    if (!confirm("Are you sure you want to clear all workflow logs?")) return;
    setClearing(true);
    try {
      await fetch("/api/admin/workflows", { method: "DELETE" });
      setWorkflows([]);
    } catch (error) {
      console.error("Failed to clear workflows:", error);
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    const interval = setInterval(fetchWorkflows, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest">
            Background Jobs
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle size={14} className="text-gray-400 hover:text-brand-purple transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-4 bg-brand-navy text-white border-none rounded-xl shadow-2xl">
                <p className="text-xs leading-relaxed">
                  These are <strong>Upstash Workflows</strong> that handle automated tasks like:
                  <ul className="list-disc ml-4 mt-2 space-y-1">
                    <li>QuickBooks Online data sync</li>
                    <li>PDF Return generation</li>
                    <li>Automated client notifications</li>
                  </ul>
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchWorkflows}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-brand-purple hover:bg-brand-soft-gray rounded-full transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={clearAll}
            disabled={clearing || workflows.length === 0}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all disabled:opacity-50"
            title="Clear All"
          >
            {clearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {workflows.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-[10px] font-medium text-gray-400">No active or recent jobs</p>
          </div>
        ) : (
          workflows.map((wf) => (
            <div
              key={wf.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-brand-purple/20 transition-all"
            >
              <div className="flex items-center gap-3">
                {wf.status === "successful" ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : wf.status === "failed" ? (
                  <XCircle size={16} className="text-red-500" />
                ) : (
                  <Loader2 size={16} className="text-brand-orange animate-spin" />
                )}
                <div>
                  <p className="text-[11px] font-bold text-brand-navy truncate max-w-[140px]">
                    {wf.name}
                  </p>
                  <p className="text-[9px] text-gray-400 font-medium">
                    {new Date(wf.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                  wf.status === "successful"
                    ? "bg-green-100 text-green-700"
                    : wf.status === "failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-orange-100 text-brand-orange"
                }`}
              >
                {wf.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
