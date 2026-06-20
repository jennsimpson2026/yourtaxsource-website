"use client";

import Link from "next/link";
import { DollarSign, ExternalLink, Clock, AlertCircle } from "lucide-react";

interface OutstandingFee {
  id: string;
  clientName: string;
  year: number;
  taxPrepFee: number;
  amountPaid: number;
  balanceDue: number;
  status: string;
}

interface OutstandingFeesListProps {
  fees: OutstandingFee[];
}

export function OutstandingFeesList({ fees }: OutstandingFeesListProps) {
  if (fees.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
          <DollarSign size={24} />
        </div>
        <h3 className="text-lg font-bold text-brand-navy">No Outstanding Fees</h3>
        <p className="text-gray-400 text-sm mt-1">All completed returns are currently paid in full.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
          <DollarSign className="text-brand-orange" size={20} />
          Outstanding Tax Prep Fees
        </h2>
        <span className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest">
          {fees.length} Pending Payments
        </span>
      </div>

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-white sticky top-0 z-10 shadow-sm">
            <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Year</th>
              <th className="px-6 py-4">Prep Fee</th>
              <th className="px-6 py-4">Paid</th>
              <th className="px-6 py-4">Balance</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {fees.map((fee) => (
              <tr key={fee.id} className="hover:bg-brand-cloud/30 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-brand-navy">{fee.clientName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-charcoal/80 font-medium">
                  {fee.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-navy">
                  ${fee.taxPrepFee.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  ${fee.amountPaid.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-black text-red-500 bg-red-50 px-2 py-0.5 rounded">
                    ${fee.balanceDue.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-[10px] font-black uppercase bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {fee.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link 
                    href={`/admin/returns/${fee.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Return <ExternalLink size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
