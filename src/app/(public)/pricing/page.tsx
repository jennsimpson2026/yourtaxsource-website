import Link from "next/link";
import { CheckCircle2, CreditCard, ShieldCheck, Zap } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-brand-black py-16 md:py-32 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-8">Transparent <span className="text-brand-purple italic">Pricing</span>.</h1>
          <p className="text-xl text-brand-lavender/80 max-w-3xl mx-auto leading-relaxed">
            Professional tax help shouldn't be a mystery. We provide straightforward 
            pricing based on the complexity of your financial situation.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Simple Return */}
            <PricingCard
              title="Individual Simple"
              price="125"
              description="Perfect for individuals with standard W-2 income and basic deductions."
              features={[
                "Single or Married Filing Jointly",
                "W-2 Income Reporting",
                "Standard Deduction",
                "IRS Authorized e-File",
                "Direct Deposit Setup"
              ]}
              ctaText="Start Your Return"
              ctaLink="/auth/signup"
            />

            {/* Standard Return */}
            <PricingCard
              title="Individual Plus"
              price="325"
              highlighted={true}
              description="Best for families with investments, student loans, or childcare credits."
              features={[
                "Itemized Deductions (Sch A)",
                "Dividend & Interest Income",
                "Student Loan Interest",
                "Child & Dependent Care Credits",
                "Residential Energy Credits",
                "All 'Simple' Features Included"
              ]}
              ctaText="Start Your Return"
              ctaLink="/auth/signup"
            />

            {/* Business / Pro */}
            <PricingCard
              title="Business & Pro"
              price="625"
              priceSuffix="+"
              description="For sole proprietors, freelancers, and small business owners."
              features={[
                "Small Business (Sch C)",
                "Rental Property (Sch E)",
                "Capital Gains & Losses",
                "Self-Employment Tax",
                "Business Expense Review",
                "K-1 Income Reporting"
              ]}
              ctaText="Get a Custom Quote"
              ctaLink="/contact"
            />

            {/* Bookkeeping */}
            <PricingCard
              title="Monthly Bookkeeping"
              price="200"
              priceSuffix="/mo"
              description="Keep your books clean and tax-ready all year long."
              features={[
                "Bank Reconciliation",
                "Expense Categorization",
                "Financial Statement Prep",
                "Unlimited Support",
                "Quarterly Review"
              ]}
              ctaText="Get Started"
              ctaLink="/contact"
            />

            {/* Fractional Controller */}
            <PricingCard
              title="Fractional Controller"
              price="500"
              priceSuffix="/mo+"
              description="Strategic financial oversight for growing businesses."
              features={[
                "Budgeting & Forecasting",
                "Cash Flow Management",
                "Custom Reporting",
                "Strategic Advisory",
                "Performance Tracking"
              ]}
              ctaText="Book a Consult"
              ctaLink="/contact"
            />
          </div>
          
          <div className="mt-20 text-center bg-brand-cloud p-12 rounded-[2.5rem] border border-gray-100">
            <h2 className="text-3xl font-heading font-bold text-brand-black mb-4">Corporate & Complex Entities</h2>
            <p className="text-lg text-brand-charcoal/70 mb-8 max-w-2xl mx-auto">
              For S-Corps, Partnerships (1065), and C-Corps, we provide value-based 
              custom pricing after an initial consultation.
            </p>
            <Link 
              href="/contact"
              className="text-brand-purple font-bold text-lg hover:underline underline-offset-4"
            >
              Inquire about business returns &rarr;
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-brand-black text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8">Secure & Easy Payments</h2>
              <p className="text-xl text-brand-lavender/80 mb-10 leading-relaxed">
                We use bank-grade secure payment processing for Credit Cards and Bank Drafts. 
                No more writing checks or mailing payments.
              </p>
              <div className="space-y-6">
                <PaymentFeature 
                  icon={<ShieldCheck className="w-6 h-6 text-brand-purple" />}
                  title="Fully Encrypted"
                  description="Your credit card and bank information are never stored on our servers."
                />
                <PaymentFeature 
                  icon={<Zap className="w-6 h-6 text-brand-purple" />}
                  title="Instant Confirmation"
                  description="Receive an automated receipt as soon as your payment is processed."
                />
                <PaymentFeature 
                  icon={<CreditCard className="w-6 h-6 text-brand-purple" />}
                  title="Multiple Options"
                  description="We accept all major credit cards (3% processing fee) and secure ACH bank drafts (eCheck)."
                />
              </div>
            </div>
            <div className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center font-bold">H</div>
                <h3 className="text-2xl font-heading font-bold">The Payment Process</h3>
              </div>
              <ol className="space-y-8 relative">
                 <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10"></div>
                 <Step number="1" title="Review Your Return" description="We'll notify you when your return is ready for review in the portal." />
                 <Step number="2" title="View Your Invoice" description="Your invoice will be available directly next to your completed documents." />
                 <Step number="3" title="Pay Securely" description="Pay via Credit Card (3% fee), Bank Draft, or use mobile apps like Venmo, Cash App, or Zelle for no fees." />
                 <Step number="4" title="Final Filing" description="Once payment is confirmed, we'll electronically file your return with the IRS." />
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-black mb-8">
            Any questions about our fees?
          </h2>
          <p className="text-xl text-brand-charcoal/70 mb-12">
            We're happy to discuss your specific situation and provide a firm 
            estimate before we begin any work.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              href="/contact"
              className="inline-block bg-brand-black text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-brand-purple transition-all shadow-lg"
            >
              Get a Personalized Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function PricingCard({ 
  title, 
  price, 
  priceSuffix = "", 
  description, 
  features, 
  ctaText, 
  ctaLink, 
  highlighted = false 
}: { 
  title: string; 
  price: string; 
  priceSuffix?: string;
  description: string; 
  features: string[]; 
  ctaText: string; 
  ctaLink: string; 
  highlighted?: boolean;
}) {
  return (
    <div className={`flex flex-col p-10 rounded-3xl transition-all ${
      highlighted 
        ? 'bg-brand-black text-white shadow-2xl scale-105 border-4 border-brand-purple relative z-10' 
        : 'bg-white text-brand-black border border-gray-100 shadow-xl hover:shadow-2xl'
    }`}>
      {highlighted && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-purple text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          Most Popular
        </div>
      )}
      <h3 className={`text-xl font-bold mb-2 ${highlighted ? 'text-brand-purple' : 'text-brand-black'}`}>{title}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-heading font-black">$</span>
        <span className="text-6xl font-heading font-black">{price}</span>
        <span className="text-2xl font-bold opacity-60">{priceSuffix}</span>
      </div>
      <p className={`mb-8 ${highlighted ? 'text-brand-lavender/80' : 'text-brand-charcoal/70'}`}>{description}</p>
      <ul className="space-y-4 mb-10 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 font-medium">
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${highlighted ? 'text-brand-purple' : 'text-brand-purple'}`} />
            <span className={highlighted ? 'text-white' : 'text-brand-charcoal'}>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaLink}
        className={`block text-center py-4 rounded-xl font-bold text-lg transition-all ${
          highlighted 
            ? 'bg-brand-purple text-white hover:bg-brand-black shadow-lg shadow-brand-purple/20' 
            : 'bg-brand-black text-white hover:bg-brand-purple shadow-md'
        }`}
      >
        {ctaText}
      </Link>
    </div>
  );
}

function PaymentFeature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1">{icon}</div>
      <div>
        <h4 className="font-bold text-lg">{title}</h4>
        <p className="text-brand-lavender/70">{description}</p>
      </div>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-6 relative z-10">
      <div className="w-12 h-12 bg-brand-black border-2 border-white/20 rounded-full flex items-center justify-center font-bold text-brand-purple flex-shrink-0 shadow-lg">
        {number}
      </div>
      <div>
        <h4 className="font-bold text-xl mb-1">{title}</h4>
        <p className="text-brand-lavender/70">{description}</p>
      </div>
    </div>
  );
}
