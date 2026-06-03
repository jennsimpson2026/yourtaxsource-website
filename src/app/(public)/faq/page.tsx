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
                      href="https://www.google.com/maps/search/?api=1&query=100+1/2+S+Main+Street,+Belmont,+NC+28012"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-purple hover:underline inline-flex items-center font-bold"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      100 1/2 S Main Street, Belmont, NC 28012
                    </a>
                    .
                  </>
                }
                icon={<ShieldCheck className="w-5 h-5 text-brand-purple" />}
              />
              <FAQItem
                question="What should I prepare for my first meeting?"
                answer="For new clients, we typically need your previous year's tax return, social security numbers for all dependents, and any income statements (W-2s, 1099s). Don't worry—our portal will give you a customized checklist based on your situation."
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
                answer="Our fees depend on the complexity of your return. Simple individual returns start at $150. For business returns and advisory, we'll provide a transparent quote after our initial consultation. We never charge hidden fees."
                icon={<CreditCard className="w-5 h-5 text-brand-purple" />}
              />
              <FAQItem
                question="How do I pay for your services?"
                answer="We make payments easy through Helcim. You can pay your invoice securely online via credit card or bank transfer directly through our client portal once your return is ready for review."
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
                className="inline-block bg-brand-black text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-blue-900 transition-all shadow-lg"
              >
                Send Us a Message
              </Link>
              <Link
                href="tel:5551234567"
                className="inline-block bg-transparent border-2 border-brand-black text-brand-black px-10 py-5 rounded-xl font-bold text-xl hover:bg-brand-cloud transition-all flex items-center justify-center gap-2"
              >
                (555) 123-4567
              </Link>
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
