"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signEngagementLetter } from "@/actions/engagement";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, Loader2, PenTool, ShieldCheck, AlertCircle, Check } from "lucide-react";

function EngagementLetterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const letterId = searchParams.get("id");

  const [status, setStatus] = useState<"loading" | "ready" | "signing" | "success" | "error">("loading");
  const [signature, setSignature] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [consentElectronic, setConsentElectronic] = useState(false);
  const [responsibility, setResponsibility] = useState(false);
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
    if (!agreed || !consentElectronic || !responsibility) {
      setError("Please review and check all three authorization boxes below.");
      return;
    }
    if (!signature.trim()) {
      setError("Please type your full legal name to sign.");
      return;
    }

    setStatus("signing");
    setError(null);

    try {
      const result = await signEngagementLetter(
        letterId!, 
        signature,
        agreed,
        consentElectronic,
        responsibility
      );
      if (result?.error) {
        setError(result.error);
        setStatus("ready");
      } else {
        setStatus("success");
        setTimeout(() => router.push("/portal"), 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred during signing.");
      setStatus("ready");
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
              <p className="text-brand-lavender/60 text-sm font-medium">Tax Preparation Agreement</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck size={14} className="text-brand-purple" /> Secure Signing
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          <div className="prose prose-brand max-w-none text-brand-charcoal/80 leading-relaxed max-h-[500px] overflow-y-auto p-8 bg-gray-50 rounded-2xl border border-gray-100 text-sm whitespace-pre-wrap">
            <div className="text-center mb-8">
              <h2 className="text-brand-black font-black uppercase tracking-tight mb-1">Your Tax Source</h2>
              <p className="text-xs font-bold text-brand-charcoal/40">Tax Preparation Engagement Agreement</p>
            </div>
            {`This Engagement Agreement ("Agreement") is entered into between Your Tax Source ("Firm") and the undersigned client ("Client").

Purpose of Engagement
The purpose of this Agreement is to confirm our understanding of the services we will provide and to outline the responsibilities of both parties. Your Tax Source agrees to prepare the Client's federal and applicable state income tax returns based solely upon information and documentation provided by the Client.

Our Responsibilities
Your Tax Source will:
- Prepare federal and applicable state tax returns for the tax year selected by the Client.
- Electronically file eligible returns once all required signatures and authorizations have been received.
- Exercise due professional care in preparing returns.
- Maintain confidentiality of Client information in accordance with applicable laws and regulations.
- Provide access to documents through our secure client portal.

Client Responsibilities
The Client agrees to:
- Provide complete, accurate, and timely information necessary to prepare tax returns.
- Review all completed returns prior to filing.
- Notify Your Tax Source of any errors, omissions, or changes before filing.
- Maintain supporting documentation for income, deductions, credits, and other tax positions taken on the return.
- Respond promptly to requests for additional information.
The Client understands that they are ultimately responsible for the accuracy of information reported on their tax returns.

Document Submission
The Client agrees to submit tax documents through the secure client portal whenever possible. While email communication may be used for general correspondence, sensitive tax documents should not be transmitted through unsecured methods.

Electronic Signatures & Electronic Filing
The Client consents to:
- Electronic delivery of documents.
- Electronic signatures.
- Electronic filing of tax returns where permitted.
Electronic signatures shall carry the same legal effect as handwritten signatures.

Tax Positions & Accuracy
Your Tax Source will rely upon information provided by the Client without independently verifying its accuracy. If we identify information that appears incomplete, inconsistent, or questionable, we may request additional clarification or documentation. We reserve the right to withdraw from the engagement if sufficient information is not provided.

Fees & Payment
Preparation fees vary based on complexity and services required. Payment is due upon completion of services unless alternative arrangements have been made in writing. Your Tax Source reserves the right to withhold final copies of returns until outstanding balances have been satisfied.

Audit & Examination Services
This engagement does not include representation before the Internal Revenue Service, state taxing authorities, or any governmental agency. If examination, audit, or representation services become necessary, a separate engagement agreement may be required.

Refunds
The Client acknowledges that:
- Tax refunds are issued solely by the taxing authority.
- Your Tax Source cannot guarantee refund amounts or processing timelines.
- Refund delays caused by government agencies are outside of our control.

Limitation of Liability
To the fullest extent permitted by law, Your Tax Source's liability arising from this engagement shall be limited to the amount of fees paid for the services giving rise to the claim. Under no circumstances shall Your Tax Source be liable for consequential, incidental, indirect, or punitive damages.

Record Retention
Your Tax Source will retain electronic copies of prepared returns and supporting workpapers according to our record retention policies. Clients are encouraged to maintain their own permanent copies of all tax documents.

Consent to Portal Communication
The Client authorizes Your Tax Source to:
- Deliver tax returns
- Deliver invoices
- Request documentation
- Send engagement letters
- Provide status updates
through the secure client portal and associated electronic communication systems.

Authorization
By signing below, I acknowledge that I have read and understand this Engagement Agreement and agree to its terms. I certify that all information I provide to Your Tax Source will be complete and accurate to the best of my knowledge.`}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSign} className="space-y-8 pt-8 border-t border-gray-100">
            {/* Required Authorization Checkboxes */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-brand-black uppercase tracking-wider mb-4">
                Required Authorizations
              </label>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setAgreed(!agreed)}
                  className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group ${
                    agreed ? 'bg-brand-purple/5 border-brand-purple/20' : 'bg-white border-gray-100 hover:border-brand-purple/30'
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                    agreed ? 'bg-brand-purple border-brand-purple text-white' : 'border-gray-300'
                  }`}>
                    {agreed && <Check size={16} strokeWidth={4} />}
                  </div>
                  <span className={`text-sm font-medium leading-snug ${agreed ? 'text-brand-purple' : 'text-brand-charcoal/70'}`}>
                    I have read and agree to the Engagement Agreement.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setConsentElectronic(!consentElectronic)}
                  className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group ${
                    consentElectronic ? 'bg-brand-purple/5 border-brand-purple/20' : 'bg-white border-gray-100 hover:border-brand-purple/30'
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                    consentElectronic ? 'bg-brand-purple border-brand-purple text-white' : 'border-gray-300'
                  }`}>
                    {consentElectronic && <Check size={16} strokeWidth={4} />}
                  </div>
                  <span className={`text-sm font-medium leading-snug ${consentElectronic ? 'text-brand-purple' : 'text-brand-charcoal/70'}`}>
                    I consent to electronic delivery of documents.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setResponsibility(!responsibility)}
                  className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group ${
                    responsibility ? 'bg-brand-purple/5 border-brand-purple/20' : 'bg-white border-gray-100 hover:border-brand-purple/30'
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                    responsibility ? 'bg-brand-purple border-brand-purple text-white' : 'border-gray-300'
                  }`}>
                    {responsibility && <Check size={16} strokeWidth={4} />}
                  </div>
                  <span className={`text-sm font-medium leading-snug ${responsibility ? 'text-brand-purple' : 'text-brand-charcoal/70'}`}>
                    I understand I am responsible for reviewing my completed return before filing.
                  </span>
                </button>
              </div>
            </div>

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
                    placeholder="Type your name to sign"
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
                disabled={status === "signing" || !letterId || !agreed || !consentElectronic || !responsibility}
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
