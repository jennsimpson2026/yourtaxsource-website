"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, XCircle, Loader2, RefreshCw, Trash2, Activity } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

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

  const deleteWorkflow = async (id: string) => {
    if (!confirm("Are you sure you want to dismiss this background job?")) return;
    
    try {
      const res = await fetch(`/api/admin/workflows/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success("Job dismissed");
        fetchWorkflows();
      } else {
        toast.error("Failed to dismiss job");
      }
    } catch (error) {
      toast.error("An error occurred");
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
            <div key={wf.id} className="p-4 flex items-center justify-between hover:bg-brand-cloud/30 transition-colors group">
              <div className="flex items-center gap-3">
                <StatusIcon status={wf.status} />
                <div>
                  <p className="text-sm font-bold text-brand-navy">{wf.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {format(new Date(wf.createdAt), "MMM d, h:mm a")} • ID: {wf.id.slice(0, 8)}
                  </p>
                  {wf.error && <p className="text-[10px] text-red-500 font-medium mt-1 truncate max-w-[150px]">{wf.error}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${getStatusStyles(wf.status)}`}>
                  {wf.status}
                </span>
                {(wf.status === 'failed' || wf.status === 'successful') && (
                  <button 
                    onClick={() => deleteWorkflow(wf.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Dismiss"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
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
      return <Loader2 className="animate-spin text-brand-purple" size={18} />;
    default:
      return <Clock className="text-gray-400" size={18} />;
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "successful":
      return "bg-green-50 text-green-700 border-green-100";
    case "failed":
      return "bg-red-50 text-red-700 border-red-100";
    case "running":
      return "bg-purple-50 text-brand-purple border-purple-100";
    default:
      return "bg-gray-50 text-gray-700 border-gray-100";
  }
}
