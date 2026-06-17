import { db } from "@/lib/db";
import { taxReturns, users, questionnaires, auditLogs, invoices } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Download,
  ExternalLink,
  MessageSquare,
  CreditCard
} from "lucide-react";
import { updateReturnDetails } from "@/actions/returns";
import { DocumentRequestTool } from "@/components/admin/DocumentRequestTool";
import { CommunicationLog } from "@/components/admin/CommunicationLog";
import { DocumentDownloadButton } from "@/components/admin/DocumentDownloadButton";
import { InvoiceManager } from "@/components/admin/InvoiceManager";

export default async function ReviewReturnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ret = await db.query.taxReturns.findFirst({
    where: eq(taxReturns.id, id),
    with: {
      client: {
        with: {
          profile: true,
        }
      },
      documents: true,
      questionnaire: true,
      invoices: {
        orderBy: [desc(invoices.createdAt)],
      },
    },
  });

  if (!ret) {
    notFound();
  }

  // Fetch communication logs for this client
  const logs = await db.query.auditLogs.findMany({
    where: eq(auditLogs.targetId, ret.clientId),
    orderBy: [desc(auditLogs.createdAt)],
  });

  const questionnaireData = ret.questionnaire?.data ? JSON.parse(ret.questionnaire.data) : null;

  async function handleUpdateReturn(formData: FormData) {
    "use server";
    const status = formData.get("status") as string;
    const paymentStatus = formData.get("paymentStatus") as string;
    const notes = formData.get("notes") as string;

    await updateReturnDetails(id, {
      status,
      paymentStatus,
      notes,
    });
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link href="/admin/returns" className="text-xs font-bold text-gray-400 hover:text-brand-navy flex items-center gap-1 transition-colors uppercase tracking-widest">
            <ArrowLeft size={14} /> Back to Returns
          </Link>
          <h1 className="text-4xl font-heading font-bold text-brand-navy">
            {ret.year} Tax Return
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-1.5 text-brand-charcoal/60">
              <User size={16} className="text-brand-orange" />
              {(ret as any).client?.name || "N/A"}
            </div>
            <div className="text-gray-300">•</div>
            <div className="flex items-center gap-1.5 text-brand-charcoal/60">
              <MessageSquare size={16} className="text-brand-orange" />
              {(ret as any).client?.email}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status={ret.status} />
          <PaymentBadge status={ret.paymentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Intake Questionnaire */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                <FileText className="text-brand-orange" size={20} />
                Intake Form Data
              </h2>
              {ret.questionnaire?.isSubmitted && (
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase border border-green-100">
                  Submitted {new Date(ret.questionnaire.submittedAt!).toLocaleDateString()}
                </span>
              )}
            </div>
            
            {questionnaireData ? (
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <InfoItem label="Filing Status" value={questionnaireData.filingStatus} />
                    <InfoItem label="Dependents" value={questionnaireData.dependents} />
                    <InfoItem label="Address" value={`${(ret as any).client?.profile?.addressLine1 || 'N/A'}, ${(ret as any).client?.profile?.city || ''} ${(ret as any).client?.profile?.state || ''}`} />
                  </div>
                  <div className="space-y-6">
                    <BooleanItem label="W-2 Income" value={questionnaireData.hasW2} />
                    <BooleanItem label="1099 Income" value={questionnaireData.has1099} />
                    <BooleanItem label="Small Business" value={questionnaireData.hasBusiness} />
                  </div>
                </div>
                
                {questionnaireData.notes && (
                  <div className="mt-8 p-4 bg-brand-cloud rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Client Notes</p>
                    <p className="text-sm text-brand-charcoal/80 leading-relaxed font-medium">{questionnaireData.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400 font-medium italic">
                No questionnaire data available.
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                <ShieldCheck className="text-brand-orange" size={20} />
                Client Documents
              </h2>
              <span className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest">
                {ret.documents.length} Files
              </span>
            </div>
            
            <div className="divide-y divide-gray-50">
              {ret.documents.length > 0 ? (
                ret.documents.map((doc) => (
                  <div key={doc.id} className="p-5 flex items-center justify-between hover:bg-brand-cloud/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-cloud rounded-xl flex items-center justify-center text-brand-navy border border-gray-100">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-navy group-hover:text-brand-orange transition-colors line-clamp-1">
                          {doc.fileName}
                          {doc.category === "ADMIN_ONLY" && (
                            <span className="ml-2 px-1.5 py-0.5 bg-brand-purple/10 text-brand-purple text-[8px] font-black uppercase rounded-md border border-brand-purple/20">
                              Admin Only
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          {doc.category} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <DocumentDownloadButton documentId={doc.id} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 font-medium italic">
                  No documents uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
          {/* Workflow Management */}
          <div className="bg-brand-navy p-8 rounded-3xl shadow-xl text-white">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock size={20} className="text-brand-orange" />
              Workflow
            </h2>
            <form action={handleUpdateReturn} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Return Status</label>
                <select
                  name="status"
                  defaultValue={ret.status}
                  className="w-full rounded-xl border border-white/10 p-3 text-sm bg-white/5 focus:bg-white focus:text-brand-navy transition-all focus:outline-none focus:ring-2 focus:ring-brand-orange/50 appearance-none cursor-pointer"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="READY_FOR_SIGNATURE">Ready for Signature</option>
                  <option value="FILED">Filed</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Payment Status</label>
                <select
                  name="paymentStatus"
                  defaultValue={ret.paymentStatus}
                  className="w-full rounded-xl border border-white/10 p-3 text-sm bg-white/5 focus:bg-white focus:text-brand-navy transition-all focus:outline-none focus:ring-2 focus:ring-brand-orange/50 appearance-none cursor-pointer"
                >
                  <option value="UNPAID">Unpaid</option>
                  <option value="PAID">Paid</option>
                  <option value="VOID">Void</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Internal Staff Notes</label>
                <textarea
                  name="notes"
                  defaultValue={ret.notes || ""}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 p-4 text-sm bg-white/5 focus:bg-white focus:text-brand-navy transition-all focus:outline-none focus:ring-2 focus:ring-brand-orange/50 placeholder:text-white/20"
                  placeholder="Only visible to staff..."
                ></textarea>
              </div>

              <button type="submit" className="w-full bg-brand-purple text-white font-black py-4 rounded-2xl hover:bg-brand-purple/90 transition-all shadow-lg hover:shadow-purple-500/20 active:scale-95">
                SAVE CHANGES
              </button>
            </form>
          </div>

          {/* Document Request Tool */}
          <DocumentRequestTool clientId={ret.clientId} returnId={ret.id} />

          {/* Invoice Manager */}
          <InvoiceManager returnId={ret.id} existingInvoices={ret.invoices} />

          {/* Communication Log */}
          <CommunicationLog logs={logs as any} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm text-brand-navy font-bold">{value || 'N/A'}</p>
    </div>
  );
}

function BooleanItem({ label, value }: { label: string, value: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-bold text-brand-navy">{label}</p>
      {value ? (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle2 size={16} />
          <span className="text-[10px] font-black uppercase">Yes</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-gray-300">
          <AlertCircle size={16} />
          <span className="text-[10px] font-black uppercase tracking-wider">No</span>
        </div>
      )}
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
    <span className={`px-4 py-2 text-xs font-black rounded-full border shadow-sm ${styles[status] || styles['NOT_STARTED']}`}>
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
    <span className={`px-4 py-2 text-xs font-black rounded-xl border shadow-sm ${styles[status] || styles['UNPAID']}`}>
      {status}
    </span>
  );
}
