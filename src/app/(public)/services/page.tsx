import Link from "next/link";
import Image from "next/image";
import { User, Briefcase, TrendingUp, Calculator, CheckCircle2, Users, BarChart3 } from "lucide-react";
import { BookingButton } from "@/components/BookingButton";

export default function ServicesPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-brand-purple py-6 md:py-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-in fade-in slide-in-from-top duration-700">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">Expert Solutions for Your <span className="text-brand-lavender italic">Success</span>.</h1>
            <p className="text-xl text-brand-lavender leading-relaxed">
              From personal tax preparation to high-level business strategy, we provide 
              clear, professional, and trustworthy guidance tailored to your unique 
              financial situation.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          <ServiceDetail
            id="tax-prep"
            title="Tax Preparation"
            subtitle="Minimize your liability, maximize your peace of mind."
            description="We take the stress out of tax season for individuals, families, and businesses. Our experts ensure you're taking advantage of every deduction and credit you deserve while maintaining total compliance."
            features={[
              "W-2 & 1099 Income Reporting",
              "Multi-State Filings",
              "LLC, S-Corp, & Partnership Returns",
              "IRS Representation & Audit Support",
              "Prior Year Amendments"
            ]}
            icon={<Calculator className="w-12 h-12 text-brand-black" />}
            imageSrc="/images/jenn-prof-woman.png"
            />

            <ServiceDetail
            id="tax-planning"
            title="Tax Planning"
            subtitle="Proactive strategies for your future."
            description="Don't wait until tax season to think about your taxes. We help you plan throughout the year to minimize your tax liability and make the most of your income."
            features={[
              "Strategic Income Timing",
              "Business Entity Optimization",
              "Investment Tax Planning",
              "Retirement Contribution Strategies",
              "Charitable Giving Optimization"
            ]}
            icon={<TrendingUp className="w-12 h-12 text-brand-black" />}
            imageSrc="/images/jenn-hero-authentic.png"
            reverse
            />

            <ServiceDetail
            id="bookkeeping"
            title="Bookkeeping & Financials"
            subtitle="Clear visibility into your business health."
            description="Accurate bookkeeping is the foundation of a successful business. We keep your financial records flawless and ready for tax time, providing you with the data you need to grow."
            features={[
              "Monthly Bank Reconciliation",
              "Accounts Payable & Receivable",
              "Financial Statement Preparation",
              "Expense Tracking & Categorization",
              "Cloud-Based Real-Time Access"
            ]}
            icon={<Briefcase className="w-12 h-12 text-brand-black" />}
            imageSrc="/images/jenn-consultation-authentic.png"
            />

            <ServiceDetail
            id="advisory"
            title="Fractional Controller / CFO"
            subtitle="Strategy for the road ahead."
            description="Gain the expertise of a high-level financial executive without the full-time cost. We provide strategic oversight, cash flow analysis, and financial planning to help your business reach the next level."
            features={[
              "Strategic Financial Planning",
              "Cash Flow Management & Projections",
              "Budgeting & Performance Analysis",
              "Process Improvement & Optimization",
              "Board & Investor Reporting"
            ]}
            icon={<BarChart3 className="w-12 h-12 text-brand-black" />}
            imageSrc="/images/jenn-conf-presenter.png"
            reverse
            />

            <ServiceDetail
            id="formation"
            title="Business Formation & Advisory"
            subtitle="Start your journey on the right foot."
            description="Launching a new venture? We guide you through the process of selecting the right entity type, setting up your accounting systems, and establishing solid financial foundations."
            features={[
              "Entity Selection (LLC, S-Corp, etc.)",
              "EIN & State Registration Support",
              "Chart of Accounts Setup",
              "Owner Compensation Planning",
              "New Business Consultations"
            ]}
            icon={<Users className="w-12 h-12 text-brand-black" />}
            imageSrc="/images/jenn-meeting-authentic.png"
            />
        </div>
      </section>

      <section className="py-24 bg-brand-cloud">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple opacity-5 rounded-full -mr-16 -mt-16"></div>
            <Calculator className="w-16 h-16 text-brand-purple mx-auto mb-8" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-black mb-6">Need a custom solution?</h2>
            <p className="text-xl text-brand-charcoal/70 mb-10 max-w-2xl mx-auto font-medium">
              Every financial situation is different. If you have a unique challenge or 
              need a specialized service not listed here, we'd love to chat.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Link
                 href="/contact"
                 className="inline-block bg-brand-black text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-black transition-all shadow-lg hover:scale-[1.02]"
               >
                 Ask About Custom Services
               </Link>
               <BookingButton />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceDetail({
  id,
  title,
  subtitle,
  description,
  features,
  icon,
  imageSrc,
  reverse = false
}: {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  imageSrc: string;
  reverse?: boolean;
}) {
  return (
    <div id={id} className={`grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
      <div className={`${reverse ? 'lg:order-2' : ''} animate-in fade-in slide-in-from-left duration-1000`}>
        <div className="mb-8 bg-brand-soft-gray w-20 h-20 rounded-3xl flex items-center justify-center border border-gray-100 shadow-sm group hover:bg-brand-purple/10 transition-colors">
          {icon}
        </div>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-black mb-4 tracking-tight">{title}</h2>
        <p className="text-xl text-brand-purple font-black mb-8 uppercase tracking-widest text-xs">{subtitle}</p>
        <p className="text-brand-charcoal/80 text-lg mb-10 leading-relaxed font-medium">{description}</p>
        <ul className="space-y-4">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-brand-charcoal/80 font-bold">
              <CheckCircle2 className="w-6 h-6 text-brand-purple flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl ${reverse ? 'lg:order-1' : ''} group animate-in fade-in slide-in-from-right duration-1000`}>
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 via-transparent to-transparent opacity-60"></div>
      </div>
    </div>
  );
}
