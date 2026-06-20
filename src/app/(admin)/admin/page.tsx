import React from "react";
import { db } from "@/lib/db";
import { users, taxReturns, questionnaires, invoices, documents } from "@/lib/db/schema";
import { count, eq, desc, and, not, sql, gt } from "drizzle-orm";
import Link from "next/link";
import { 
  Users, 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  ArrowRight,
  DollarSign,
  FileSearch,
  RefreshCw
} from "lucide-react";
import DocumentReviewQueue from "@/components/admin/DocumentReviewQueue";
import { getDocumentReviewQueue } from "@/actions/documents";
import WorkflowStatus from "@/components/admin/WorkflowStatus";
import { SyncQboButton } from "@/components/admin/SyncQboButton";
import { OutstandingFeesList } from "@/components/admin/OutstandingFeesList";

export default async function AdminDashboard() {
  const clientCount = await db.select({ value: count() }).from(users).where(eq(users.role, "CLIENT"));
  const returnCount = await db.select({ value: count() }).from(taxReturns);
  
  const pendingReturns = await db.select({ value: count() })
    .from(taxReturns)
    .where(and(
      not(eq(taxReturns.status, "FILED")),
      not(eq(taxReturns.status, "NOT_STARTED"))
    ));

  const pendingQuestionnaires = await db.select({ value: count() })
    .from(questionnaires)
    .where(eq(questionnaires.isSubmitted, true));

  const unpaidInvoices = await db.select({ value: count() })
    .from(invoices)
    .where(eq(invoices.status, "UNPAID"));

  const pendingDocsCount = await db.select({ value: count() })
    .from(documents)
    .where(and(
      eq(documents.status, "PENDING"),
      sql`${documents.deletedAt} IS NULL`
    ));

  const recentReturns = await db.query.taxReturns.findMany({
    with: {
      client: true,
    },
    limit: 5,
    orderBy: [desc(taxReturns.updatedAt)],
  });

  const outstandingFeesReturns = await db.query.taxReturns.findMany({
    where: and(
      inArray(taxReturns.status, ["FILED", "AWAITING_PAYMENT", "READY_FOR_SIGNATURE"]),
      not(eq(taxReturns.paymentStatus, "PAID")),
      gt(taxReturns.taxPrepFee, 0)
    ),
    with: {
      client: true,
      invoices: true,
    },
    orderBy: [desc(taxReturns.updatedAt)],
  });

  const outstandingFeesData = outstandingFeesReturns.map(ret => {
    const totalPaid = ret.invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + Number(inv.amount), 0);
    
    return {
      id: ret.id,
      clientName: (ret as any).client?.name || 'N/A',
      year: ret.year,
      taxPrepFee: Number(ret.taxPrepFee || 0),
      amountPaid: totalPaid,
      balanceDue: Math.max(0, Number(ret.taxPrepFee || 0) - totalPaid),
      status: ret.status,
    };
  });

  const reviewQueue = await getDocumentReviewQueue();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-heading font-bold text-brand-navy">Welcome back, Staff</h1>
        <p className="text-brand-charcoal/60 mt-2 font-medium">Here is what's happening with your clients today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          icon={<Users className="text-blue-600" size={24} />}
          label="Total Clients"
          value={clientCount[0].value}
          subtext="Registered users"
        />
        <StatsCard 
          icon={<FileText className="text-brand-orange" size={24} />}
          label="Active Returns"
          value={pendingReturns[0].value}
          subtext="In progress / Review"
        />
        <StatsCard 
          icon={<FileSearch className="text-purple-600" size={24} />}
          label="Docs to Review"
          value={pendingDocsCount[0].value}
          subtext="Pending approval"
        />
        <StatsCard 
          icon={<DollarSign className="text-brand-navy" size={24} />}
          label="Pending Payments"
          value={unpaidInvoices[0].value}
          subtext="Awaiting client payment"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Activity Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                <Clock size={20} className="text-brand-orange" />
                Recent Activity
              </h2>
              <Link href="/admin/returns" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-white text-left text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Year</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-brand-cloud/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-brand-navy group-hover:text-brand-orange transition-colors">
                          {(ret as any).client?.name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">{(ret as any).client?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-charcoal/80 font-medium">
                        {ret.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={ret.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link 
                          href={`/admin/returns/${ret.id}`} 
                          className="inline-flex items-center gap-1 text-xs font-bold bg-brand-cloud text-brand-navy px-3 py-1.5 rounded-lg hover:bg-brand-navy hover:text-white transition-all"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {recentReturns.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 font-medium">No active returns found.</p>
              </div>
            )}
          </div>

          {/* Outstanding Fees Section */}
          <OutstandingFeesList fees={outstandingFeesData} />

          {/* Document Review Queue */}
          <DocumentReviewQueue initialDocuments={reviewQueue} />
        </div>

        {/* Priority Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <RefreshCw size={16} className="text-brand-orange" />
                Quick Actions
              </span>
            </h3>
            <SyncQboButton />
          </div>

          <WorkflowStatus />

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-brand-orange" />
              Attention Needed
            </h3>
            <div className="space-y-4">
              {pendingQuestionnaires[0].value > 0 && (
                <div className="flex items-start gap-3 p-3 bg-brand-orange/5 rounded-xl border border-brand-orange/10">
                  <Activity className="text-brand-orange mt-0.5" size={16} />
                  <div>
                    <p className="text-xs font-bold text-brand-navy">New Intake Forms</p>
                    <p className="text-[10px] text-brand-charcoal/60 mt-0.5 font-medium">{pendingQuestionnaires[0].value} forms awaiting initial review.</p>
                  </div>
                </div>
              )}
              {unpaidInvoices[0].value > 0 && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <DollarSign className="text-blue-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-xs font-bold text-brand-navy">Pending Payments</p>
                    <p className="text-[10px] text-brand-charcoal/60 mt-0.5 font-medium">{unpaidInvoices[0].value} invoices awaiting payment.</p>
                  </div>
                </div>
              )}
              {pendingQuestionnaires[0].value === 0 && unpaidInvoices[0].value === 0 && (
                <div className="text-center py-6">
                   <CheckCircle2 className="mx-auto text-green-200 mb-2" size={32} />
                   <p className="text-xs text-gray-400 font-medium">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-brand-navy p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 opacity-10">
                <FileText size={120} />
             </div>
             <h3 className="text-lg font-bold mb-2">Pro Tip</h3>
             <p className="text-xs text-blue-100/70 leading-relaxed mb-4 font-medium">
               Use the Document Request Tool in the client detail view to quickly notify clients of missing paperwork.
             </p>
             <button className="text-xs font-bold text-brand-orange hover:underline">Read more tips →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, subtext }: { icon: React.ReactNode, label: string, value: number, subtext: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-cloud transition-colors">
        {icon}
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <h3 className="text-3xl font-black text-brand-navy">{value}</h3>
      </div>
      <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">{subtext}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'NOT_STARTED': 'bg-gray-100 text-gray-600 border-gray-200',
    'IN_PROCESS': 'bg-blue-100 text-brand-navy border-brand-navy/10',
    'READY_FOR_SIGNATURE': 'bg-green-100 text-brand-green border-brand-green/10',
    'AWAITING_PAYMENT': 'bg-orange-100 text-brand-orange border-brand-orange/10',
    'FILED': 'bg-gray-100 text-gray-400 border-gray-200',
  };
  
  return (
    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${styles[status] || styles['NOT_STARTED']}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
