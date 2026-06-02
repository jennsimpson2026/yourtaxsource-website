import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AnnualUpdateForm } from "@/components/portal/AnnualUpdateForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Phase2ComingSoon } from "@/components/portal/Phase2ComingSoon";

export default async function AnnualUpdatePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Phase 1 Guard: Disable PII collection until encryption is configured
  if (!process.env.ENCRYPTION_KEY) {
    return <Phase2ComingSoon title="Annual Update Coming Soon" />;
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/portal" 
          className="inline-flex items-center gap-2 text-brand-charcoal/60 hover:text-brand-purple font-bold text-sm mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>
        
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-black mb-4">2024 Tax Season Update</h1>
          <p className="text-brand-charcoal/60 text-lg">
            We've streamlined our onboarding process. Please complete the following form to update your information for the current tax year.
          </p>
        </div>

        <AnnualUpdateForm />
      </div>
    </div>
  );
}
