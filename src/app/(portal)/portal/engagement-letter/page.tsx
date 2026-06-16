"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signEngagementLetter } from "@/actions/engagement";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, Loader2, PenTool, ShieldCheck, AlertCircle } from "lucide-react";

function EngagementLetterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const letterId = searchParams.get("id");

  const [status, setStatus] = useState<"loading" | "ready" | "signing" | "success" | "error">("loading");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!letterId) {
      setStatus("error");
      setError("No engagement letter found. Please contact Jenn if you believe this is an error.");
      return;
    }
    // Simulate loading
    const timer = setTimeout(() => setStatus("ready"), 1000);
    return () => clearTimeout(timer);
  }, [letterId]);

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!signature.trim()) {
      setError("Please type your full legal name to sign.");
      return;
    }

    setStatus("signing");
    setError(null);

    try {
      const result = await signEngagementLetter(letterId!, signature);
      if (result?.error) {
        setError(result.error);
        setStatus("error");
      } else {
        setStatus("success");
        setTimeout(() => router.push("/portal"), 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred during signing.");
      setStatus("error");
    }
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-purple mb-4" size={40} />
        <p className="text-brand-charcoal/60 font-bold">Loading your engagement letter...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-8 bg-white p-12 rounded-[2.5rem] shadow-xl border border-green-100">
        <div className="mx-auto w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-4xl font-black text-brand-black">Signed Successfully!</h2>
        <p className="text-brand-charcoal/70 text-lg leading-relaxed">
          Thank you for signing your engagement letter. We have recorded your electronic signature and can now proceed with your tax return.
        </p>
        <p className="text-sm text-brand-charcoal/40">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <Link 
        href="/portal" 
        className="inline-flex items-center gap-2 text-brand-charcoal/60 hover:text-brand-purple font-bold text-sm mb-4 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-brand-black p-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-purple/20 rounded-xl flex items-center justify-center text-brand-lavender border border-brand-purple/30">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Engagement Letter</h1>
              <p className="text-brand-lavender/60 text-sm font-medium">Tax Year 2024</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck size={14} className="text-brand-purple" /> Secure Signing
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          <div className="prose prose-brand max-w-none text-brand-charcoal/80 leading-relaxed max-h-96 overflow-y-auto p-6 bg-gray-50 rounded-2xl border border-gray-100 italic text-sm">
            <p className="font-bold text-brand-black mb-4 not-italic">Dear Neighbor,</p>
            <p>This letter is to confirm and specify the terms of our engagement with you and to clarify the nature and extent of the services we will provide. In order to ensure an understanding of our mutual responsibilities, we ask all clients for whom returns are prepared to confirm the following arrangements.</p>
            <p>We will prepare your 2024 federal and requested state individual income tax returns from information which you will furnish to us. We will not audit or otherwise verify the data you submit, although it may be necessary to ask you for clarification of some of the information. We will furnish you with questionnaires and/or organizers to guide you in gathering the necessary information.</p>
            <p>It is your responsibility to provide all the information required for the preparation of complete and accurate returns. You should retain all the documents, canceled checks and other data that form the basis of income and deductions. These may be necessary to prove the accuracy and completeness of the returns to a taxing authority. You have the final responsibility for the income tax returns and, therefore, you should review them carefully before you sign them.</p>
            <p>Our work in connection with the preparation of your income tax returns does not include any procedures designed to discover defalcations or other irregularities, should any exist.</p>
            <p className="font-bold text-brand-black mt-6 not-italic">Fees & Payment</p>
            <p>Our fee for these services will be based upon the complexity of the return and the time required at our standard billing rates. All invoices are due and payable upon completion of the tax return and before the return is electronically filed.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSign} className="space-y-6 pt-8 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-brand-black uppercase tracking-wider">
                  Full Legal Name (Electronic Signature)
                </label>
                <div className="relative">
                  <PenTool className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text"
                    required
                    placeholder="Type your name exactly as it appears on your ID"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all font-heading text-lg italic"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-brand-charcoal/50 font-medium">
                  By typing your name above, you are providing a legally binding electronic signature and agree to the terms of this engagement letter.
                </p>
              </div>
              
              <button
                type="submit"
                disabled={status === "signing" || !letterId}
                className="bg-brand-black text-white px-8 py-5 rounded-2xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-xl shadow-brand-black/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {status === "signing" ? (
                  <><Loader2 className="animate-spin" size={24} /> Signing...</>
                ) : (
                  <><CheckCircle2 size={24} /> Sign Engagement Letter</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EngagementLetterPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-purple" size={40} /></div>}>
      <EngagementLetterForm />
    </Suspense>
  );
}
