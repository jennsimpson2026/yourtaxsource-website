import { db } from "@/lib/db";
import { users, taxReturns, questionnaires, invoices, documents } from "@/lib/db/schema";
import { count, eq, desc, and, not, sql, gt, inArray } from "drizzle-orm";
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
import { WorkflowStatus } from "@/components/admin/WorkflowStatus";
import { SyncQboButton } from "@/components/admin/SyncQboButton";
import { OutstandingFeesList } from "@/components/admin/OutstandingFeesList";

export default async function AdminDashboard() {
  const [
    clientCountResult,
    returnCountResult,
    pendingReturnsResult,
    pendingQuestionnairesResult,
    pendingPaymentsCountResult,
    pendingDocsCountResult,
    recentReturns,
    outstandingFeesReturns,
    dbReadyToFileReturns,
    reviewQueue
  ] = await Promise.all([
    db.select({ value: count() }).from(users).where(eq(users.role, "CLIENT")),
    db.select({ value: count() }).from(taxReturns),
    db.select({ value: count() })
      .from(taxReturns)
      .where(and(
        not(eq(taxReturns.status, "COMPLETED")),
        not(eq(taxReturns.status, "NOT_STARTED"))
      )),
    db.select({ value: count() })
      .from(questionnaires)
      .where(eq(questionnaires.isSubmitted, true)),
    db.select({ value: count() })
      .from(taxReturns)
      .where(and(
        inArray(taxReturns.status, ["COMPLETED", "AWAITING_PAYMENT", "READY_FOR_SIGNATURE", "READY_TO_FILE"]),
        not(eq(taxReturns.paymentStatus, "PAID")),
        gt(taxReturns.taxPrepFee, 0)
      )),
    db.select({ value: count() })
      .from(documents)
      .where(and(
        eq(documents.status, "PENDING"),
        sql`${documents.deletedAt} IS NULL`
      )),
    db.query.taxReturns.findMany({
      with: {
        client: true,
      },
      limit: 5,
      orderBy: [desc(taxReturns.updatedAt)],
    }),
    db.query.taxReturns.findMany({
      where: and(
        inArray(taxReturns.status, ["COMPLETED", "AWAITING_PAYMENT", "READY_FOR_SIGNATURE", "READY_TO_FILE"]),
        not(eq(taxReturns.paymentStatus, "PAID")),
        gt(taxReturns.taxPrepFee, 0)
      ),
      with: {
        client: true,
        invoices: true,
      },
      orderBy: [desc(taxReturns.updatedAt)],
    }),
    db.query.taxReturns.findMany({
      where: and(
        eq(taxReturns.status, "READY_TO_FILE"),
        eq(taxReturns.paymentStatus, "PAID")
      ),
      with: {
        client: true,
        invoices: true,
      },
      orderBy: [desc(taxReturns.updatedAt)],
    }),
    getDocumentReviewQueue()
  ]);

  const clientCount = clientCountResult;
  const returnCount = returnCountResult;
  const pendingReturns = pendingReturnsResult;
  const pendingQuestionnaires = pendingQuestionnairesResult;
  const pendingPaymentsCount = pendingPaymentsCountResult;
  const pendingDocsCount = pendingDocsCountResult;

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

  const readyToFileReturns = dbReadyToFileReturns.filter(ret => {
    const totalPaid = ret.invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + Number(inv.amount), 0);
    const balance = Math.max(0, Number(ret.taxPrepFee || 0) - totalPaid);
    return balance === 0;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-brand-navy tracking-tight">Admin Dashboard</h1>
          <p className="text-brand-charcoal/60 mt-1 font-medium">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                   {String.fromCharCode(64 + i)}
                </div>
              ))}
           </div>
           <p className="text-xs font-bold text-brand-navy">3 Staff Online</p>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          icon={<Users className="text-brand-purple" />}
          label="Total Clients"
          value={clientCount[0].value}
          subtext="Active in portal"
        />
        <StatsCard 
          icon={<FileText className="text-brand-purple" />}
          label="Returns"
          value={returnCount[0].value}
          subtext="Total across all years"
        />
        <StatsCard 
          icon={<Clock className="text-brand-orange" />}
          label="Active Returns"
          value={pendingReturns[0].value}
          subtext="In Process / Signed"
        />
        <StatsCard 
          icon={<FileSearch className="text-brand-purple" />}
          label="Pending Docs"
          value={pendingDocsCount[0].value}
          subtext="Awaiting review"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Activity Area */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-brand-navy flex items-center gap-2 text-lg">
                <Activity size={20} className="text-brand-purple" />
                Recent Returns
              </h3>
              <Link href="/admin/returns" className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Year</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-brand-navy">{(ret as any).client?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-gray-400 font-medium tracking-tight">{(ret as any).client?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-brand-purple">{ret.year}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={ret.status || 'NOT_STARTED'} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/returns/${ret.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-brand-navy hover:bg-brand-purple hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {recentReturns.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                        No returns found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Document Review Queue */}
          <DocumentReviewQueue initialDocuments={reviewQueue} />
          
          {/* Outstanding Fees */}
          <OutstandingFeesList fees={outstandingFeesData} />
        </div>

        {/* Sidebar */}
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
              {readyToFileReturns.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle2 className="text-green-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-xs font-bold text-brand-navy">Ready to File</p>
                    <p className="text-[10px] text-brand-charcoal/60 mt-0.5 font-medium">{readyToFileReturns.length} returns are paid and awaiting filing.</p>
                  </div>
                </div>
              )}
              {pendingQuestionnaires[0].value > 0 && (
                <div className="flex items-start gap-3 p-3 bg-brand-orange/5 rounded-xl border border-brand-orange/10">
                  <Activity className="text-brand-orange mt-0.5" size={16} />
                  <div>
                    <p className="text-xs font-bold text-brand-navy">New Intake Forms</p>
                    <p className="text-[10px] text-brand-charcoal/60 mt-0.5 font-medium">{pendingQuestionnaires[0].value} forms awaiting initial review.</p>
                  </div>
                </div>
              )}
              {pendingPaymentsCount[0].value > 0 && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <DollarSign className="text-blue-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-xs font-bold text-brand-navy">Pending Payments</p>
                    <p className="text-[10px] text-brand-charcoal/60 mt-0.5 font-medium">{pendingPaymentsCount[0].value} returns awaiting payment.</p>
                  </div>
                </div>
              )}
              {readyToFileReturns.length === 0 && pendingQuestionnaires[0].value === 0 && pendingPaymentsCount[0].value === 0 && (
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
  const normalizedStatus = status?.toUpperCase();
  const styles: Record<string, string> = {
    'NOT_STARTED': 'bg-gray-100 text-gray-600 border-gray-200',
    'IN_PROCESS': 'bg-blue-100 text-brand-navy border-brand-navy/10',
    'READY_FOR_SIGNATURE': 'bg-green-100 text-brand-green border-brand-green/10',
    'AWAITING_PAYMENT': 'bg-orange-100 text-brand-orange border-brand-orange/10',
    'READY_TO_FILE': 'bg-purple-100 text-brand-purple border-brand-purple/10',
    'COMPLETED': 'bg-green-600 text-white border-green-700',
  };

  return (
    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${styles[normalizedStatus] || styles['NOT_STARTED']}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
