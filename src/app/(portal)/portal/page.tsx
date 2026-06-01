import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { taxReturns, appointments } from "@/lib/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import Link from "next/link";
import { BookingButton } from "@/components/BookingButton";
import { FileText, ClipboardCheck, Calendar, ArrowRight, ShieldCheck } from "lucide-react";

export default async function PortalDashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  const returns = await db.query.taxReturns.findMany({
    where: eq(taxReturns.clientId, userId),
    orderBy: [desc(taxReturns.year)],
  });

  const upcomingAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.userId, userId),
      gte(appointments.startTime, new Date())
    ),
    orderBy: [desc(appointments.startTime)],
  });

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="bg-brand-navy rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange opacity-10 rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Welcome back, <span className="text-brand-orange">{session?.user?.name?.split(' ')[0] || 'Neighbor'}</span>
            </h2>
            <p className="text-blue-100 text-lg max-w-xl">
              Manage your tax documents and track your return progress securely in one place.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <BookingButton className="bg-brand-orange text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg flex items-center justify-center gap-2" />
            <div className="flex items-center justify-center gap-2 text-xs text-blue-100/60 font-bold uppercase tracking-widest">
              <ShieldCheck size={14} /> Bank-Grade Security
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Documents Card */}
        <DashboardCard
          title="Secure Documents"
          description="Upload tax forms, receipts, and identification securely."
          icon={<FileText className="text-brand-navy" size={28} />}
          href="/portal/documents"
          linkText="Manage Documents"
        />

        {/* Questionnaire Card */}
        <DashboardCard
          title="Intake Form"
          description="Complete your annual tax questionnaire to help us find every deduction."
          icon={<ClipboardCheck className="text-brand-navy" size={28} />}
          href="/portal/questionnaire"
          linkText="Start Form"
        />

        {/* Appointments Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-brand-cloud rounded-2xl flex items-center justify-center">
              <Calendar className="text-brand-navy" size={24} />
            </div>
            <h3 className="text-xl font-heading font-bold text-brand-navy">Appointments</h3>
          </div>
          
          <div className="flex-grow">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="p-4 rounded-2xl bg-brand-cloud border border-gray-100">
                    <p className="font-bold text-brand-navy">
                      {new Date(apt.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-brand-charcoal/60">
                      {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-brand-charcoal/50 italic text-sm py-4">
                No upcoming appointments. Need help? Book a slot above.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tax Returns Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-2xl font-heading font-bold text-brand-navy">Your Tax Returns</h2>
          <span className="px-3 py-1 bg-brand-cloud text-brand-charcoal/40 rounded-full text-xs font-bold uppercase tracking-widest">
            {returns.length} Total
          </span>
        </div>
        
        <div className="p-8">
          {returns.length > 0 ? (
            <div className="overflow-x-auto text-left">
              <table className="min-w-full">
                <thead>
                  <tr className="text-brand-charcoal/40 text-xs font-bold uppercase tracking-widest border-b border-gray-50">
                    <th className="pb-4 font-bold">Tax Year</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold text-right">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {returns.map((ret) => (
                    <tr key={ret.id} className="group">
                      <td className="py-6 font-bold text-lg text-brand-navy">{ret.year}</td>
                      <td className="py-6">
                        <span className={`
                          px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                          ${ret.status === 'DONE' ? 'bg-green-50 text-brand-green border-brand-green/20' : 
                            ret.status === 'ACTION_NEEDED' ? 'bg-orange-50 text-brand-orange border-brand-orange/20' :
                            'bg-blue-50 text-brand-navy border-brand-navy/20'}
                        `}>
                          {ret.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-6 text-right">
                        <span className={`text-sm font-bold ${ret.paymentStatus === 'PAID' ? 'text-brand-green' : 'text-brand-charcoal/40'}`}>
                          {ret.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-brand-cloud rounded-[2rem] border-2 border-dashed border-gray-200">
               <ClipboardCheck size={48} className="mx-auto text-brand-charcoal/10 mb-4" />
               <p className="text-brand-charcoal/50 font-medium max-w-sm mx-auto">
                 Ready to get started? Open the intake form above to begin your first tax return with us.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ 
  title, 
  description, 
  icon, 
  href, 
  linkText 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  href: string; 
  linkText: string;
}) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
      <div className="w-14 h-14 bg-brand-cloud rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-orange/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-heading font-bold text-brand-navy mb-3">{title}</h3>
      <p className="text-brand-charcoal/60 text-sm mb-8 leading-relaxed">
        {description}
      </p>
      <Link
        href={href}
        className="flex items-center gap-2 text-brand-orange font-bold text-sm hover:gap-3 transition-all"
      >
        {linkText} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
