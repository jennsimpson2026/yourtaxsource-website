"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function WorkflowStatus() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch("/api/admin/workflows");
      const data = await res.json();
      setWorkflows(data);
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    const interval = setInterval(fetchWorkflows, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && workflows.length === 0) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-brand-navy" /></div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
          <Activity size={20} className="text-brand-orange" />
          Background Jobs
        </h2>
        <button onClick={fetchWorkflows} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <RefreshCw size={16} className="text-gray-400" />
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {workflows.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No background jobs found.</div>
        ) : (
          workflows.map((wf) => (
            <div key={wf.id} className="p-4 flex items-center justify-between hover:bg-brand-cloud/30 transition-colors">
              <div className="flex items-center gap-3">
                <StatusIcon status={wf.status} />
                <div>
                  <p className="text-sm font-bold text-brand-navy">{wf.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {format(new Date(wf.createdAt), "MMM d, h:mm a")} • ID: {wf.id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${getStatusStyles(wf.status)}`}>
                  {wf.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "successful":
      return <CheckCircle2 className="text-green-500" size={18} />;
    case "failed":
      return <XCircle className="text-red-500" size={18} />;
    case "running":
      return <Loader2 className="animate-spin text-blue-500" size={18} />;
    default:
      return <Clock className="text-gray-400" size={18} />;
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "successful":
      return "bg-green-50 text-green-600 border-green-100";
    case "failed":
      return "bg-red-50 text-red-600 border-red-100";
    case "running":
      return "bg-blue-50 text-blue-600 border-blue-100";
    default:
      return "bg-gray-50 text-gray-600 border-gray-100";
  }
}

import { Activity } from "lucide-react";
