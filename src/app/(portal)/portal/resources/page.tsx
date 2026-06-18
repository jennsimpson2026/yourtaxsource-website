import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { engagementLetters, taxReturns } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import Link from "next/link";
import { 
  FileText, 
  Download, 
  PenTool, 
  ArrowRight,
  ShieldCheck,
  Briefcase
} from "lucide-react";
import { DownloadEngagementLetterButton } from "@/components/portal/DownloadEngagementLetterButton";

export default async function ResourcesPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const userId = (session.user as any).id;

  const returns = await db.query.taxReturns.findMany({
    where: eq(taxReturns.clientId, userId),
    orderBy: [desc(taxReturns.year)],
  });

  const returnIds = returns.map(r => r.id);

  const letters = returnIds.length > 0 
    ? await db.query.engagementLetters.findMany({
        where: and(
          eq(engagementLetters.returnId, returnIds[0]), // Show latest return's letter
        )
      })
    : [];

  const currentLetter = letters[0];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div>
        <h1 className="text-4xl font-heading font-bold text-brand-black mb-4">Resources</h1>
        <p className="text-brand-charcoal/60 text-lg">
          Important documents, guides, and templates for your tax preparation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Engagement Letter Section */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="w-14 h-14 bg-brand-lavender rounded-2xl flex items-center justify-center mb-6">
            <PenTool className="text-brand-purple" size={28} />
          </div>
          <h3 className="text-xl font-heading font-bold text-brand-black mb-3">Engagement Letter</h3>
          <p className="text-brand-charcoal/60 text-sm mb-8 leading-relaxed">
            Your professional services agreement. This must be signed before we can begin work on your return.
          </p>
          <div className="mt-auto">
            {currentLetter?.status === 'SIGNED' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                  <ShieldCheck size={18} /> Signed on {new Date(currentLetter.signedAt!).toLocaleDateString()}
                </div>
                <DownloadEngagementLetterButton letterId={currentLetter.id} />
              </div>
            ) : currentLetter ? (
              <Link
                href={`/portal/engagement-letter?id=${currentLetter.id}`}
                className="inline-flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
              >
                Sign Engagement Letter <ArrowRight size={16} />
              </Link>
            ) : (
              <p className="text-gray-400 italic text-sm">No engagement letter available at this time.</p>
            )}
          </div>
        </div>

        {/* Helpful Guides Section */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="w-14 h-14 bg-brand-soft-gray rounded-2xl flex items-center justify-center mb-6">
            <FileText className="text-brand-navy" size={28} />
          </div>
          <h3 className="text-xl font-heading font-bold text-brand-black mb-3">Tax Preparation Checklist</h3>
          <p className="text-brand-charcoal/60 text-sm mb-8 leading-relaxed">
            A comprehensive list of documents and information you'll need for your tax appointment.
          </p>
          <button className="mt-auto inline-flex items-center gap-2 text-brand-purple font-bold text-sm hover:gap-3 transition-all">
            Download PDF <Download size={16} />
          </button>
        </div>
      </div>
      
      <div className="bg-brand-navy p-10 rounded-[2.5rem] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple opacity-10 rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10">
           <h3 className="text-2xl font-heading font-bold mb-4 flex items-center gap-3">
             <Briefcase className="text-brand-orange" /> Business Resources
           </h3>
           <p className="text-white/60 mb-8 max-w-2xl">
             Access specialized templates for bookkeeping, expense tracking, and small business tax planning.
           </p>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="#" className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex justify-between items-center group">
                <span className="font-bold">Mileage Log Template</span>
                <Download size={16} className="text-brand-orange group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex justify-between items-center group">
                <span className="font-bold">Home Office Worksheet</span>
                <Download size={16} className="text-brand-orange group-hover:scale-110 transition-transform" />
              </a>
           </div>
        </div>
      </div>
    </div>
  );
}
