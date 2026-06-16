import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { taxReturns, appointments, invoices, auditLogs, engagementLetters } from "@/lib/db/schema";
import { eq, desc, and, gte, inArray } from "drizzle-orm";
import Link from "next/link";
import { BookingButton } from "@/components/BookingButton";
import { PayInvoiceButton } from "@/components/portal/PayInvoiceButton";
import { OpenRequests } from "@/components/portal/OpenRequests";
import { DownloadEngagementLetterButton } from "@/components/portal/DownloadEngagementLetterButton";
import { 
  FileText, 
  ClipboardCheck, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Upload, 
  ExternalLink, 
  Lock, 
  CreditCard,
  CheckCircle2,
  Circle,
  HelpCircle,
  Zap,
  PenTool,
  Download
} from "lucide-react";

export default async function PortalDashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  const returns = await db.query.taxReturns.findMany({
    where: eq(taxReturns.clientId, userId),
    orderBy: [desc(taxReturns.year)],
  });

  const returnIds = returns.map(r => r.id);

  const pendingLetters = returnIds.length > 0 
    ? await db.query.engagementLetters.findMany({
        where: and(
          inArray(engagementLetters.returnId, returnIds),
          eq(engagementLetters.status, "PENDING")
        )
      })
    : [];

  const currentYear = new Date().getFullYear();
  const currentReturn = returns.find(r => r.year === currentYear) || returns[0];

  const currentLetter = currentReturn 
    ? await db.query.engagementLetters.findFirst({
        where: eq(engagementLetters.returnId, currentReturn.id)
      })
    : null;

  const upcomingAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.userId, userId),
      gte(appointments.startTime, new Date())
    ),
    orderBy: [desc(appointments.startTime)],
  });

  const unpaidInvoices = await db.query.invoices.findMany({
    where: and(
      eq(invoices.userId, userId),
      eq(invoices.status, "UNPAID")
    ),
  });

  const openRequests = await db.query.auditLogs.findMany({
    where: and(
      eq(auditLogs.targetId, userId),
      inArray(auditLogs.action, ["REQUEST_DOCUMENT", "REQUEST_DOCUMENTS"])
    ),
    orderBy: [desc(auditLogs.createdAt)],
    limit: 5,
  });

  const currentYear = new Date().getFullYear();
  const currentReturn = returns.find(r => r.year === currentYear) || returns[0];

  const hasEncryption = !!process.env.ENCRYPTION_KEY;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Welcome Banner */}
      <div className="bg-brand-black rounded-[2.5rem] p-8 md:p-14 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple opacity-20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-purple/20 text-brand-lavender rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-brand-purple/30">
              <ShieldCheck size={12} /> Secure Client Environment
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Welcome, <span className="text-brand-purple">{session?.user?.name?.split(' ')[0] || 'Neighbor'}</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
              Your Boutique Advisory hub for tax preparation, secure document sharing, and financial strategy.
            </p>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-80">
            {hasEncryption ? (
              <Link 
                href="/portal/annual-update"
                className="bg-brand-purple text-white px-8 py-5 rounded-2xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-3 group"
              >
                <ClipboardCheck size={24} />
                Annual Update
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div className="bg-brand-purple/20 text-brand-lavender/50 px-8 py-5 rounded-2xl font-bold text-lg flex flex-col items-center justify-center gap-1 border border-brand-purple/30 italic">
                <span className="flex items-center gap-2"><Lock size={18} /> Annual Update</span>
                <span className="text-[10px] uppercase tracking-widest">Coming in Phase 2</span>
              </div>
            )}
            <BookingButton className="bg-white text-brand-black px-8 py-4 rounded-2xl font-bold text-base hover:bg-gray-100 transition-all flex items-center justify-center gap-2" />
          </div>
        </div>
      </div>

      {/* Open Requests */}
      <OpenRequests 
        requests={openRequests} 
        unpaidInvoices={unpaidInvoices} 
        pendingLetters={pendingLetters}
      />

      {/* 7-Step Visual Timeline */}
      <section className="bg-white rounded-[2rem] p-8 md:p-12 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <h3 className="text-2xl font-heading font-bold text-brand-black">Your Tax Filing Journey</h3>
          <div className="text-sm font-bold text-brand-purple bg-brand-purple/5 px-4 py-2 rounded-full">
            Status: {currentReturn?.status?.replace('_', ' ') || 'Starting Soon'}
          </div>
        </div>
        
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 hidden md:block"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-8 gap-8 relative z-10">
            <TimelineStep 
              number={1} 
              label="Annual Update" 
              status={currentReturn?.status === 'IN_PROGRESS' || currentReturn?.status === 'ACTION_NEEDED' ? 'current' : 'completed'} 
              icon={<ClipboardCheck size={20} />}
            />
            <TimelineStep 
              number={2} 
              label="Engagement Letter" 
              status={currentLetter?.status === 'SIGNED' ? 'completed' : (currentReturn?.status !== 'NOT_STARTED' ? 'current' : 'pending')} 
              icon={<PenTool size={20} />}
            />
            <TimelineStep 
              number={3} 
              label="Upload Docs" 
              status={currentLetter?.status === 'SIGNED' ? 'current' : 'pending'} 
              icon={<Upload size={20} />}
            />
            <TimelineStep 
              number={4} 
              label="Tax Preparation" 
              status="pending" 
              icon={<Lock size={20} />}
            />
            <TimelineStep 
              number={5} 
              label="Tax Organizer" 
              status="pending" 
              icon={<FileText size={20} />}
            />
            <TimelineStep 
              number={6} 
              label="Review & File" 
              status="pending" 
              icon={<ShieldCheck size={20} />}
            />
            <TimelineStep 
              number={7} 
              label="Payment" 
              status="pending" 
              icon={<CreditCard size={20} />}
            />
            <TimelineStep 
              number={8} 
              label="Complete" 
              status="pending" 
              icon={<CheckCircle2 size={20} />}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engagement Letter Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
          <div className="w-14 h-14 bg-brand-soft-gray rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-lavender transition-colors">
            <PenTool className="text-brand-purple" size={28} />
          </div>
          <h3 className="text-xl font-heading font-bold text-brand-black mb-3">Engagement Letter</h3>
          <p className="text-brand-charcoal/60 text-sm mb-8 leading-relaxed">
            {currentLetter?.status === 'SIGNED' 
              ? "Your engagement letter has been signed and is on file."
              : "Please review and sign your professional services agreement to begin."}
          </p>
          <div className="mt-auto">
            {currentLetter?.status === 'SIGNED' ? (
              <DownloadEngagementLetterButton letterId={currentLetter.id} />
            ) : (
              <Link
                href={currentLetter ? `/portal/engagement-letter?id=${currentLetter.id}` : "#"}
                className="flex items-center gap-2 text-brand-purple font-bold text-sm hover:gap-3 transition-all"
              >
                Sign Now <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>

        {/* Step 3: Upload Docs */}
        {process.env.AWS_S3_BUCKET ? (
          <DashboardCard
            title="Step 3: Upload Documents"
            description="Securely upload your W-2s, 1099s, and other tax-related files."
            icon={<Upload className="text-brand-purple" size={28} />}
            href="/portal/documents"
            linkText="Go to Uploads"
            accentColor="purple"
          />
        ) : (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col opacity-75">
            <div className="w-14 h-14 bg-brand-soft-gray rounded-2xl flex items-center justify-center mb-6">
              <Upload className="text-gray-400" size={28} />
            </div>
            <h3 className="text-xl font-heading font-bold text-gray-500 mb-3">Step 3: Upload Docs</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Securely upload your tax files. (Coming Soon in Phase 2).
            </p>
            <span className="mt-auto text-brand-purple/50 font-bold text-sm flex items-center gap-2 italic">
              <Lock size={16} /> Phase 2 Feature
            </span>
          </div>
        )}

        {/* Step 4: Tax Preparation */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
          <div className="w-14 h-14 bg-brand-soft-gray rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-lavender transition-colors">
            <ExternalLink className="text-brand-purple" size={28} />
          </div>
          <h3 className="text-xl font-heading font-bold text-brand-black mb-3">Step 4: Tax Preparation</h3>
          <p className="text-brand-charcoal/60 text-sm mb-8 leading-relaxed">
            Access your permanent document storage and prior year returns through our secure legacy portal.
          </p>
          <a
            href="https://yourtaxsource.portal.com" // Example link
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex items-center gap-2 text-brand-purple font-bold text-sm hover:gap-3 transition-all"
          >
            Access Legacy Portal <ExternalLink size={16} />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Unpaid Invoices */}
        {unpaidInvoices.length > 0 && (
          <section id="invoices" className="bg-brand-lavender/30 rounded-[2rem] p-8 md:p-10 border border-brand-lavender shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-purple shadow-sm">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-heading font-bold text-brand-black">Outstanding Invoices</h3>
                <p className="text-brand-purple font-bold text-sm">Action Required: Payment Needed</p>
              </div>
            </div>
            <div className="space-y-4">
              {unpaidInvoices.map((invoice) => (
                <div key={invoice.id} className="bg-white p-6 rounded-2xl shadow-sm border border-brand-lavender/50 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <p className="text-sm font-bold text-brand-charcoal/60 uppercase tracking-wider">Invoice #{invoice.id.slice(0, 8)}</p>
                    <p className="text-3xl font-bold text-brand-black">${Number(invoice.amount).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <PayInvoiceButton invoiceId={invoice.id} />
                    <p className="text-[10px] text-brand-charcoal/40 font-bold uppercase tracking-tight text-right">
                      Credit Card (3% processing fee) or Bank Draft (eCheck)
                    </p>
                    <Link href="#manual-payment" className="text-[10px] text-brand-purple font-bold uppercase tracking-tight hover:underline">
                      Pay manually (No Fees)
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-brand-lavender/50">
              <p className="text-sm font-bold text-brand-black mb-4">Or pay via mobile app (No Fees):</p>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="bg-white/50 px-3 py-1.5 rounded-full border border-brand-lavender text-brand-purple font-bold">Venmo: @Jennifer-Simpson-59</div>
                <div className="bg-white/50 px-3 py-1.5 rounded-full border border-brand-lavender text-brand-purple font-bold">Cash App: $YTSJenn</div>
                <div className="bg-white/50 px-3 py-1.5 rounded-full border border-brand-lavender text-brand-purple font-bold">Zelle: (980) 285-1495</div>
              </div>
            </div>
          </section>
        )}

        {/* Manual Payment Section */}
        <section id="manual-payment" className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-brand-lavender rounded-2xl flex items-center justify-center text-brand-purple">
              <Zap size={24} />
            </div>
            <h3 className="text-2xl font-heading font-bold text-brand-black">Manual Payment (No Fees)</h3>
          </div>
          <p className="text-brand-charcoal/60 text-sm mb-8 leading-relaxed">
            Prefer to pay via mobile app? Scan the codes below or use the direct links to pay Jenn directly. 
            <span className="block mt-2 font-bold text-brand-purple italic">Please include your Invoice # in the payment notes to ensure your payment is credited correctly.</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="w-40 h-40 bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-[10px] text-center px-4 font-bold uppercase tracking-widest">
                 Venmo QR Code
               </div>
               <a href="https://venmo.com/u/Jennifer-Simpson-59" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-2">
                 @Jennifer-Simpson-59 <ExternalLink size={14} />
               </a>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="w-40 h-40 bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-[10px] text-center px-4 font-bold uppercase tracking-widest">
                 Cash App QR Code
               </div>
               <a href="https://cash.app/$YTSJenn" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-green-600 hover:underline flex items-center gap-2">
                 $YTSJenn <ExternalLink size={14} />
               </a>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="w-40 h-40 bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-[10px] text-center px-4 font-bold uppercase tracking-widest">
                 Zelle
               </div>
               <div className="text-sm font-bold text-brand-purple flex flex-col items-center gap-1">
                 <span>(980) 285-1495</span>
                 <span className="text-[10px] text-gray-400 uppercase">Jenn Simpson</span>
               </div>
            </div>
          </div>
        </section>

        {/* Other Payment Methods Section */}
        <section className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-brand-lavender rounded-2xl flex items-center justify-center text-brand-purple">
              <CreditCard size={24} />
            </div>
            <h3 className="text-2xl font-heading font-bold text-brand-black">Other Payment Methods</h3>
          </div>
          <p className="text-brand-charcoal/60 text-sm mb-6">
            We accept the following secure payment methods for your convenience:
          </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-purple"></div>
                <span className="font-bold text-brand-black text-sm">Credit Card (3% processing fee)</span>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-purple"></div>
                <span className="font-bold text-brand-black text-sm">Bank Draft (eCheck)</span>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-purple"></div>
                <span className="font-bold text-brand-black text-sm">Venmo (@Jennifer-Simpson-59)</span>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-purple"></div>
                <span className="font-bold text-brand-black text-sm">Cash App ($YTSJenn)</span>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-purple"></div>
                <span className="font-bold text-brand-black text-sm">Zelle ((980) 285-1495)</span>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-purple"></div>
                <span className="font-bold text-brand-black text-sm">Cash / Check</span>
              </div>
            </div>
        </section>

        {/* Privacy & Security Section */}
        <section className="bg-brand-black rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-purple opacity-10 rounded-full -mb-10 -mr-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-brand-lavender">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-2xl font-heading font-bold">Privacy & Security</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Your security is our top priority. We use bank-grade encryption to protect your Personally Identifiable Information (PII) and financial data.
            </p>
            <ul className="space-y-3 text-sm font-medium text-brand-lavender/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-purple" /> Encrypted file storage and transfer
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-purple" /> Multi-factor authentication enabled
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-purple" /> Compliant with IRS security requirements
              </li>
            </ul>
          </div>
        </section>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-soft-gray rounded-2xl flex items-center justify-center text-brand-purple">
                <Calendar size={24} />
              </div>
              <h3 className="text-2xl font-heading font-bold text-brand-black">Upcoming Appointments</h3>
            </div>
            <BookingButton className="text-brand-purple font-bold text-sm hover:underline" label="Book New" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-brand-black text-lg">
                    {new Date(apt.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-brand-charcoal/60">
                    {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-brand-purple">
                  <Calendar size={20} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TimelineStep({ 
  number, 
  label, 
  status, 
  icon 
}: { 
  number: number; 
  label: string; 
  status: 'completed' | 'current' | 'pending';
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center relative">
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center mb-4 border-2 transition-all duration-500
        ${status === 'completed' ? 'bg-brand-purple border-brand-purple text-white' : 
          status === 'current' ? 'bg-white border-brand-purple text-brand-purple scale-110 shadow-lg shadow-brand-purple/20' : 
          'bg-white border-gray-200 text-gray-300'}
      `}>
        {status === 'completed' ? <CheckCircle2 size={24} /> : icon}
      </div>
      <div className="space-y-1">
        <p className={`text-[10px] font-black uppercase tracking-tighter ${status === 'pending' ? 'text-gray-300' : 'text-brand-purple'}`}>
          Step {number}
        </p>
        <p className={`text-xs font-bold leading-tight ${status === 'pending' ? 'text-gray-400' : 'text-brand-black'}`}>
          {label}
        </p>
      </div>
    </div>
  );
}

function DashboardCard({ 
  title, 
  description, 
  icon, 
  href, 
  linkText,
  accentColor
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  href: string; 
  linkText: string;
  accentColor?: string;
}) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1 flex flex-col">
      <div className="w-14 h-14 bg-brand-soft-gray rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-lavender transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-heading font-bold text-brand-black mb-3">{title}</h3>
      <p className="text-brand-charcoal/60 text-sm mb-8 leading-relaxed">
        {description}
      </p>
      <Link
        href={href}
        className="mt-auto flex items-center gap-2 text-brand-purple font-bold text-sm hover:gap-3 transition-all"
      >
        {linkText} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
