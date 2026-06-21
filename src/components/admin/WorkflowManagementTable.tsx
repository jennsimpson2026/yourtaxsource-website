"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  DollarSign,
  User,
  ExternalLink,
  ArrowUpDown
} from "lucide-react";
import Link from "next/link";

interface WorkflowReturn {
  id: string;
  clientName: string;
  clientEmail: string;
  year: number;
  status: string;
  step: number; // 1-7
  fedResult: number | null;
  stateResult: number | null;
  fee: number | null;
  balance: number | null;
  paymentStatus: string;
  lastLogin: string | null;
  downloaded: boolean;
}

interface WorkflowManagementTableProps {
  returns: any[]; // The initial returns from DB
}

export function WorkflowManagementTable({ returns: initialReturns }: WorkflowManagementTableProps) {
  const [selectedReturns, setSelectedReturns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Map the DB returns to our workflow format
  const workflowReturns: WorkflowReturn[] = initialReturns.map(r => {
    let stateVal = 0;
    if (r.stateResults) {
      try {
        let parsed = typeof r.stateResults === 'string' ? JSON.parse(r.stateResults) : r.stateResults;
        // Handle double stringification
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        stateVal = Object.values(parsed).reduce((sum: any, val: any) => sum + (parseFloat(val) || 0), 0) as number;
      } catch (e) {}
    }

    return {
      id: r.id,
      clientName: r.client?.name || "N/A",
      clientEmail: r.client?.email || "N/A",
      year: r.year,
      status: r.status,
      step: mapStatusToStep(r.status),
      fedResult: r.federalResult,
      stateResult: stateVal,
      fee: r.taxPrepFee || r.invoices?.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0) || 0,
      balance: r.invoices?.filter((inv: any) => inv.status === 'UNPAID').reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0) || 0,
      paymentStatus: r.paymentStatus,
      lastLogin: (r.client as any)?.lastLoginAt,
      downloaded: !!(r as any).downloadedAt // This would need to be tracked in audit logs or a column
    };
  });

  const toggleSelectAll = () => {
    if (selectedReturns.length === workflowReturns.length) {
      setSelectedReturns([]);
    } else {
      setSelectedReturns(workflowReturns.map(r => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedReturns.includes(id)) {
      setSelectedReturns(selectedReturns.filter(sid => sid !== id));
    } else {
      setSelectedReturns([...selectedReturns, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder="Search by client name or email..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all w-80 shadow-sm"
             />
           </div>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-brand-charcoal hover:text-brand-purple hover:border-brand-purple transition-all shadow-sm font-bold text-sm">
             <Filter size={18} />
             Filters
           </button>
        </div>

        <div className="flex items-center gap-3">
          {selectedReturns.length > 0 && (
            <button className="flex items-center gap-2 px-4 py-2.5 bg-brand-purple text-white rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-brand-purple/20 font-bold text-sm">
              <Download size={18} />
              Bulk Download ({selectedReturns.length})
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="min-w-full divide-y divide-gray-100 border-collapse">
            <thead className="bg-gray-50/50">
              <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 font-black">
                <th className="px-6 py-5 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedReturns.length === workflowReturns.length && workflowReturns.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
                  />
                </th>
                <th className="px-6 py-5">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-brand-purple transition-colors">
                    Client <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-6 py-5">Return Status (6 Steps)</th>
                <th className="px-6 py-5">Results (Fed/State)</th>
                <th className="px-6 py-5">Financials</th>
                <th className="px-6 py-5">Activity</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {workflowReturns.map((ret) => (
                <tr key={ret.id} className={`hover:bg-brand-lavender/5 transition-colors group ${selectedReturns.includes(ret.id) ? 'bg-brand-lavender/10' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      checked={selectedReturns.includes(ret.id)}
                      onChange={() => toggleSelect(ret.id)}
                      className="rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-lavender rounded-full flex items-center justify-center text-brand-purple font-bold border border-brand-purple/10 uppercase text-xs">
                        {ret.clientName[0]}
                      </div>
                      <div className="max-w-[150px]">
                        <div className="font-bold text-brand-black truncate group-hover:text-brand-purple transition-colors">
                          {ret.clientName}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold truncate tracking-tight">{ret.clientEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6].map((s) => (
                          <div 
                            key={s}
                            title={getStepLabel(s)}
                            className={`w-4 h-1.5 rounded-full ${
                              s < ret.step ? 'bg-brand-purple' : 
                              s === ret.step ? 'bg-brand-purple animate-pulse' : 
                              'bg-gray-100'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] font-black text-brand-purple uppercase tracking-tighter">
                        Step {ret.step}: {getStepLabel(ret.step)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 w-8">FED:</span>
                        <span className={`text-xs font-black ${ret.fedResult && ret.fedResult < 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {ret.fedResult ? (ret.fedResult < 0 ? `(${Math.abs(ret.fedResult).toLocaleString()})` : `$${ret.fedResult.toLocaleString()}`) : '--'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 w-8">STATE:</span>
                        <span className={`text-xs font-black ${ret.stateResult && ret.stateResult < 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {ret.stateResult ? (ret.stateResult < 0 ? `(${Math.abs(ret.stateResult).toLocaleString()})` : `$${ret.stateResult.toLocaleString()}`) : '--'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 w-12">FEE:</span>
                        <span className="text-xs font-black text-brand-black">${ret.fee?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 w-12">BAL:</span>
                        <span className={`text-xs font-black ${ret.balance && ret.balance > 0 ? 'text-brand-purple' : 'text-green-600'}`}>
                          ${ret.balance?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold">
                        <Clock size={12} className="text-gray-300" />
                        {ret.lastLogin ? `Login: ${new Date(ret.lastLogin).toLocaleDateString()}` : 'Never'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        {ret.downloaded ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Downloaded
                          </span>
                        ) : (
                          <span className="text-gray-400 flex items-center gap-1">
                            <Clock size={12} /> Not Downloaded
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="relative group/actions">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-brand-purple">
                          <MoreHorizontal size={18} />
                        </button>
                        
                        {/* Dropdown Menu (Simplified for UI Design) */}
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 hidden group-hover/actions:block">
                          <button className="w-full text-left px-4 py-2 text-xs font-bold text-brand-black hover:bg-brand-lavender/10 flex items-center gap-2">
                            <DollarSign size={14} /> Enter Fee
                          </button>
                          <button className="w-full text-left px-4 py-2 text-xs font-bold text-brand-black hover:bg-brand-lavender/10 flex items-center gap-2">
                            <CheckCircle2 size={14} /> Mark Paid Offline
                          </button>
                          <button className="w-full text-left px-4 py-2 text-xs font-bold text-brand-black hover:bg-brand-lavender/10 flex items-center gap-2">
                            <ExternalLink size={14} /> Release Return
                          </button>
                          <button className="w-full text-left px-4 py-2 text-xs font-bold text-brand-purple hover:bg-brand-lavender/10 flex items-center gap-2 border-t border-gray-50 mt-1 pt-3">
                            <AlertCircle size={14} /> Complimentary
                          </button>
                        </div>
                      </div>
                      
                      <Link 
                        href={`/admin/returns/${ret.id}`} 
                        className="p-2 bg-brand-lavender/30 text-brand-purple rounded-lg hover:bg-brand-purple hover:text-white transition-all group/btn"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {workflowReturns.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-brand-soft-gray rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-brand-navy">No tax returns matching your search</h3>
            <p className="text-gray-400 text-sm mt-1 font-medium">Try adjusting your filters or search terms.</p>
          </div>
        )}
        
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Showing {workflowReturns.length} clients
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-brand-purple disabled:opacity-50" disabled>
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <span className="text-[10px] font-bold text-brand-black px-3">Page 1 of 1</span>
            <button className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-brand-purple disabled:opacity-50" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function mapStatusToStep(status: string): number {
  switch (status) {
    case 'NOT_STARTED': return 1;
    case 'IN_PROCESS': return 2;
    case 'READY_FOR_SIGNATURE': return 3;
    case 'AWAITING_PAYMENT': return 4;
    case 'READY_TO_FILE': return 5;
    case 'COMPLETED': return 6;
    default: return 1;
  }
}

function getStepLabel(step: number): string {
  const steps = [
    "Not Started",
    "In Process",
    "Ready for Signature",
    "Awaiting Payment",
    "Ready to File",
    "Completed"
  ];
  return steps[step - 1] || "Unknown";
}
