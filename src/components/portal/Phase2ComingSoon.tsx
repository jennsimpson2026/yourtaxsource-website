import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export function Phase2ComingSoon({ title = "Feature Coming Soon" }: { title?: string }) {
  return (
    <div className="bg-brand-lavender/20 border border-brand-purple/20 rounded-[2rem] p-12 text-center max-w-2xl mx-auto my-12">
      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-brand-purple shadow-sm mx-auto mb-8">
        <ShieldAlert size={40} />
      </div>
      <h2 className="text-3xl font-heading font-bold text-brand-black mb-4">{title}</h2>
      <p className="text-brand-charcoal/70 text-lg mb-10 leading-relaxed">
        We are currently finalizing the bank-grade security protocols for this feature to ensure your sensitive data is fully protected. This feature will be enabled in Phase 2 of our portal launch.
      </p>
      <Link 
        href="/portal" 
        className="inline-flex items-center justify-center px-8 py-4 bg-brand-purple text-white rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-brand-purple/20"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
