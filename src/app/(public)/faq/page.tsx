import { HelpCircle, ArrowRight, MessageCircle, ShieldCheck, Clock, CreditCard, MapPin } from "lucide-react";
import Link from "next/link";

export default function FAQPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-brand-black py-16 md:py-32 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-8">Frequently Asked <span className="text-brand-purple italic">Questions</span>.</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about our tax preparation and advisory services. 
            Can't find what you're looking for? Reach out and we'll be happy to help.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <FAQCategory title="Getting Started">
              <FAQItem
                question="How do I get my documents to you?"
                answer={
                  <>
                    We use a secure, encrypted client portal. Once you sign up, you can upload your documents (photos of forms, PDFs, or spreadsheets) directly to our system from your phone or computer. No need to drop off physical papers! But if you'd rather meet face-to-face or drop off documents in person, you're always welcome at our office at{" "}
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=100+1/2+S+Main+St,+Belmont,+NC+28012"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-purple hover:underline inline-flex items-center font-bold"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      100 1/2 S Main St, Belmont, NC 28012
                    </a>
                    .
                  </>
                }
                icon={<ShieldCheck className="w-5 h-5 text-brand-purple" />}
              />
              <FAQItem
                question="What should I prepare for my first meeting?"
                answer={
                  <div className="space-y-4">
                    <p>For new clients, we'll typically need:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>A copy of last year's tax return (if available)</li>
                      <li>Photo ID for all taxpayers</li>
                      <li>Social Security numbers and dates of birth for yourself, your spouse, and any dependents</li>
                      <li>Income documents such as W-2s, 1099s, K-1s, SSA-1099s, retirement statements, or other tax forms</li>
                      <li>Information related to businesses, rental properties, investments, or major life changes</li>
                      <li>Banking information if you'd like direct deposit of your refund</li>
                    </ul>
                    <p>Don't worry if you're not sure what applies to you. We'll guide you through the process and provide a customized checklist based on your specific tax situation.</p>
                  </div>
                }
                icon={<Clock className="w-5 h-5 text-brand-purple" />}
              />
            </FAQCategory>

            <FAQCategory title="Security & Privacy">
              <FAQItem
                question="Is my data secure?"
                answer="Absolutely. Security is our top priority. Our portal uses bank-level encryption (AES-256) and multi-factor authentication (MFA) to ensure that only you and our authorized staff can access your sensitive financial information."
                icon={<ShieldCheck className="w-5 h-5 text-brand-purple" />}
              />
              <FAQItem
                question="Will my information be shared with anyone else?"
                answer="No. We never sell or share your personal or financial information with third parties for marketing purposes. Your data is strictly used for the preparation of your tax returns and financial advisory."
                icon={<ShieldCheck className="w-5 h-5 text-brand-purple" />}
              />
            </FAQCategory>

            <FAQCategory title="Fees & Payments">
              <FAQItem
                question="What are your fees?"
                answer={
                  <div className="space-y-4">
                    <p>Our tax preparation fees vary based on the complexity of your return, the forms required, the number of states involved, and whether you have business, rental, investment, or self-employment activity.</p>
                    <p>Individual tax returns typically start at $125 for a basic/simple return. More involved individual returns, including dependents, credits, itemized deductions, multi-state filing, investments, rental property, or self-employment activity, are priced based on the work required. Most individual returns generally range from $125 to $550.</p>
                    <p>Business returns, bookkeeping, payroll, fractional controller services, and advisory work are quoted separately based on your specific needs.</p>
                    <p>You can view the <Link href="/pricing" className="text-brand-purple hover:underline font-bold">Pricing page</Link> for a more detailed breakdown of common service levels. We believe in transparent pricing and will discuss fees upfront before any work begins.</p>
                  </div>
                }
                icon={<CreditCard className="w-5 h-5 text-brand-purple" />}
              />
              <FAQItem
                question="How do I pay for your services?"
                answer={
                  <div className="space-y-4">
                    <p>We offer several convenient payment options. Most clients pay securely using:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Venmo (@Jennifer-Simpson-59)</li>
                      <li>Cash App ($YTSJenn)</li>
                      <li>Zelle ((980) 285-1495)</li>
                      <li>Apple Pay</li>
                      <li>Bank Draft (eCheck)</li>
                      <li>Credit or Debit Card (3% processing fee)</li>
                    </ul>
                    <p>Once your return is complete, we'll send payment instructions along with your tax summary. If paying by Bank Draft, you'll receive an email authorization request that you'll simply review and approve online.</p>
                    <p>Credit and debit cards are accepted; however, a 3% processing fee will be added to card payments. To avoid fees, many clients choose Bank Draft (eCheck), Zelle, Venmo, Cash App, or Apple Pay.</p>
                    <p>We strive to make the payment process simple, secure, and convenient for every client.</p>
                  </div>
                }
                icon={<CreditCard className="w-5 h-5 text-brand-purple" />}
              />
            </FAQCategory>

            <FAQCategory title="General Process">
              <FAQItem
                question="How long does it take to finish my return?"
                answer="Typically, once we have all your documents, we complete a draft within 5-7 business days. During peak tax season, we'll give you a more specific estimate. You can always track your return's status in the portal."
                icon={<Clock className="w-5 h-5 text-brand-purple" />}
              />
              <FAQItem
                question="Do you offer in-person appointments?"
                answer="Yes! While most of our clients prefer the convenience of our secure digital portal, we love meeting our neighbors. We offer in-person appointments at our Belmont, NC office for those in the local area."
                icon={<HelpCircle className="w-5 h-5 text-brand-purple" />}
              />
            </FAQCategory>
          </div>
        </div>
      </section>

      <section className="py-24 bg-brand-cloud">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-xl border border-gray-100">
            <MessageCircle className="w-16 h-16 text-brand-purple mx-auto mb-8" />
            <h2 className="text-3xl font-heading font-bold text-brand-black mb-6">Still have a question?</h2>
            <p className="text-xl text-brand-charcoal/70 mb-10 max-w-2xl mx-auto">
              Our team is here to help you navigate the complexities of tax season. 
              We're just a message or a phone call away.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                href="/contact"
                className="inline-block bg-brand-black text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-black transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-wider"
              >
                Send Us a Message
              </Link>
              <a
                href="tel:9802851495"
                className="inline-block bg-white text-brand-purple px-10 py-5 rounded-2xl font-black text-xl hover:bg-brand-lavender transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-wider"
              >
                (980) 285-1495
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FAQCategory({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12 last:mb-0">
      <h2 className="text-2xl font-heading font-bold text-brand-black mb-8 border-b border-gray-100 pb-4 tracking-tight">
        {title}
      </h2>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

function FAQItem({ question, answer, icon }: { question: string; answer: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="bg-brand-cloud/30 p-8 rounded-3xl border border-transparent hover:border-brand-purple/20 hover:bg-white hover:shadow-xl transition-all group">
      <div className="flex gap-4 mb-4">
        <div className="mt-1 bg-white p-2 rounded-lg shadow-sm group-hover:bg-brand-purple/10 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-heading font-bold text-brand-black leading-tight">{question}</h3>
      </div>
      <div className="pl-12">
        <p className="text-brand-charcoal/70 text-lg leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}
