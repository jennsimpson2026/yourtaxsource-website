import { db } from "@/lib/db";
import { taxReturns, users } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import Link from "next/link";
import { Search, Filter, FileText, ArrowUpDown, ChevronRight } from "lucide-react";

export default async function ReturnsAdminPage() {
  const returns = await db.query.taxReturns.findMany({
    with: {
      client: true,
    },
    orderBy: [desc(taxReturns.createdAt)],
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-brand-navy">Tax Returns</h1>
          <p className="text-brand-charcoal/60 mt-1 font-medium">Manage and review all client tax filings.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder="Search clients..." 
               className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all w-64 shadow-sm"
             />
           </div>
           <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-brand-charcoal/60 hover:text-brand-navy hover:border-brand-navy transition-all shadow-sm">
             <Filter size={20} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <th className="px-6 py-5">Client</th>
                <th className="px-6 py-5">Year</th>
                <th className="px-6 py-5">Return Status</th>
                <th className="px-6 py-5">Payment</th>
                <th className="px-6 py-5">Last Activity</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-brand-cloud/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-cloud rounded-full flex items-center justify-center text-brand-navy font-bold border border-gray-100">
                        {(ret as any).client?.name?.[0] || (ret as any).client?.email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-brand-navy group-hover:text-brand-orange transition-colors">
                          {(ret as any).client?.name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">{(ret as any).client?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-bold text-brand-charcoal/80 bg-gray-100 px-2.5 py-1 rounded-lg">
                      {ret.year}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={ret.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PaymentBadge status={ret.paymentStatus} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-brand-charcoal/60 font-bold">
                      <Clock size={14} className="text-gray-300" />
                      {new Date(ret.updatedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link 
                      href={`/admin/returns/${ret.id}`} 
                      className="inline-flex items-center gap-2 text-xs font-bold bg-brand-cloud text-brand-navy px-4 py-2 rounded-xl hover:bg-brand-navy hover:text-white transition-all shadow-sm group/btn"
                    >
                      Open File
                      <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {returns.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-brand-cloud rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-brand-navy">No tax returns yet</h3>
            <p className="text-gray-400 text-sm mt-1">New returns will appear here once started by clients.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'NOT_STARTED': 'bg-gray-100 text-gray-600 border-gray-200',
    'IN_PROGRESS': 'bg-blue-100 text-brand-navy border-brand-navy/10',
    'REVIEW': 'bg-orange-100 text-brand-orange border-brand-orange/10',
    'READY_FOR_SIGNATURE': 'bg-green-100 text-brand-green border-brand-green/10',
    'FILED': 'bg-gray-100 text-gray-400 border-gray-200',
  };
  
  return (
    <span className={`px-3 py-1.5 text-[10px] font-bold rounded-full border ${styles[status] || styles['NOT_STARTED']}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'UNPAID': 'bg-red-50 text-red-600 border-red-100',
    'PAID': 'bg-green-50 text-green-600 border-green-100',
    'VOID': 'bg-gray-100 text-gray-400 border-gray-200',
  };
  
  return (
    <span className={`px-2 py-1 text-[10px] font-bold rounded ${styles[status] || styles['UNPAID']}`}>
      {status}
    </span>
  );
}
