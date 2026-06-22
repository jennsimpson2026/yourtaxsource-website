import {
  FileText,
  Globe,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Search,
  BookOpen,
  ExternalLink,
  Download,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { ResourcesFAQ } from "@/components/ResourcesFAQ";

const RESOURCES = [
  {
    category: "Tax Checklists",
    description: "Ensure you have everything ready before your appointment.",
    icon: <FileText className="text-brand-purple" size={24} />,
    items: [
      { name: "Business Startup Checklist", type: "PDF", href: "/resources/business-startup-checklist" },
      { name: "New Client Checklist", type: "PDF", href: "/resources/new-client-intake-checklist" },
      { name: "Rental Property Tax Checklist", type: "PDF", href: "/resources/rental-property-income-expense-sheet" },
      { name: "Self-Employed Tax Checklist", type: "PDF", href: "/resources/self-employed-freelancer-checklist" },
      { name: "Tax Appointment Checklist", type: "PDF", href: "/resources/tax-preparation-checklist" },
    ]
  },
  {
    category: "Government Resources",
    description: "Official resources for federal and state tax information.",
    icon: <Globe className="text-brand-purple" size={24} />,
    items: [
      { name: "IRS.gov", type: "External", href: "https://www.irs.gov", isExternal: true },
      { name: "Where’s My Refund?", type: "External", href: "https://www.irs.gov/refunds", isExternal: true },
      { name: "IRS Where’s My Amended Return?", type: "External", href: "https://www.irs.gov/filing/ame-return-where-is-my-amended-return", isExternal: true },
      { name: "Pay Federal Tax Balance", type: "External", href: "https://www.irs.gov/payments", isExternal: true },
      { name: "NC DOR Where’s My Refund?", type: "External", href: "https://www.ncdor.gov/file-pay/refund-status", isExternal: true },
      { name: "NC Pay Balance Due", type: "External", href: "https://www.ncdor.gov/file-pay/pay-online", isExternal: true },
      { name: "SC Where’s My Refund?", type: "External", href: "https://dor.sc.gov/refund", isExternal: true },
      { name: "SC Pay Balance Due", type: "External", href: "https://dor.sc.gov/pay", isExternal: true },
    ]
  },
  {
    category: "Helpful Forms",
    description: "Commonly used tax and business forms for your reference.",
    icon: <BookOpen className="text-brand-purple" size={24} />,
    items: [
      { name: "W-4", type: "PDF", href: "https://www.irs.gov/pub/irs-pdf/fw4.pdf", isExternal: true },
      { name: "W-9", type: "PDF", href: "https://www.irs.gov/pub/irs-pdf/fw9.pdf", isExternal: true },
      { name: "Form 1040", type: "PDF", href: "https://www.irs.gov/pub/irs-pdf/f1040.pdf", isExternal: true },
      { name: "Form 1040-ES", type: "PDF", href: "https://www.irs.gov/pub/irs-pdf/f1040es.pdf", isExternal: true },
      { name: "Penalty Abatement Form", type: "PDF", href: "https://www.irs.gov/payments/penalty-relief-due-to-first-time-penalty-abatement-or-other-administrative-waiver", isExternal: true },
    ]
  }
];

export default function ResourcesPage() {
  return (
    <div className="flex flex-col">
      {/* Boutique Hero Section */}
      <section className="bg-brand-black py-16 md:py-32 text-white relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "40px 40px"
          }}
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-8">Resource <span className="text-brand-purple italic">Center</span>.</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Everything you need for a smooth tax experience. From checklists to official IRS links,
            we've curated the most essential tools for our clients.
          </p>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {RESOURCES.map((group, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-brand-soft-gray rounded-2xl flex items-center justify-center border border-gray-100">
                    {group.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-brand-black">{group.category}</h2>
                  </div>
                </div>
                <p className="text-brand-charcoal/60 mb-8 font-medium">{group.description}</p>
                <div className="space-y-4 flex-1">
                  {group.items.map((item, itemIdx) => (
                    <ResourceCard key={itemIdx} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TaxSource Tracker™ Section */}
      <section id="tracker" className="py-24 bg-brand-soft-gray border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-purple/10 rounded-[3rem] -rotate-2"></div>
              <div className="relative bg-white p-8 rounded-[3rem] border border-gray-100 aspect-video flex items-center justify-center shadow-sm">
                <div className="text-center">
                  <div className="w-20 h-20 bg-brand-purple/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-brand-purple shadow-inner">
                    <Search size={40} />
                  </div>
                  <p className="font-bold text-brand-black">TaxSource Tracker™ Dashboard Preview</p>
                  <p className="text-xs text-brand-charcoal/40 uppercase tracking-widest mt-2 font-black">Coming Soon</p>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-brand-purple/20">
                Featured Resource
              </div>
              <h2 className="text-4xl font-heading font-bold text-brand-black mb-6">TaxSource Tracker™</h2>
              <p className="text-xl text-brand-charcoal/60 leading-relaxed mb-8 font-medium">
                The ultimate organizational tool for entrepreneurs and small business owners. Stop wondering where your documents are and start tracking your tax readiness in real-time.
              </p>
              <div className="space-y-6 mb-10">
                <BenefitItem label="Real-time document status tracking" />
                <BenefitItem label="Direct integration with your tax professional" />
                <BenefitItem label="Secure, encrypted 24/7 access" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Link
                  href="https://stan.store/yourtaxsource"
                  className="w-full sm:w-auto bg-brand-black text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-brand-purple transition-all shadow-xl hover:scale-105 active:scale-95 text-center"
                >
                  Order Tracker ($49)
                </Link>
                <div className="bg-brand-lavender/30 px-6 py-4 rounded-2xl border border-brand-purple/10">
                  <p className="text-xs font-medium text-brand-charcoal/80 italic">
                    "This tool saved me 20+ hours during tax season. A must-have!"
                    <span className="block mt-1 font-bold text-brand-purple not-italic">— Sarah J., Small Business Owner</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <ResourcesFAQ />
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="bg-brand-soft-gray p-12 md:p-16 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-3xl font-heading font-bold text-brand-black mb-6">Can't find what you're looking for?</h3>
            <p className="text-brand-charcoal/60 text-lg mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              Our team is here to help. If you have specific questions about a tax form or requirement, please don't hesitate to reach out.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-brand-purple text-white px-10 py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-brand-purple/20"
              >
                Contact Our Office <ArrowRight size={20} />
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-purple border border-brand-purple/20 px-10 py-4 rounded-2xl font-bold hover:bg-brand-lavender/10 transition-all shadow-sm"
              >
                Browse FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ResourceCard({ item }: { item: any }) {
  const isExternal = item.isExternal;
  return (
    <a
      href={item.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group block bg-white border border-gray-100 p-5 rounded-2xl hover:border-brand-purple hover:shadow-xl hover:shadow-brand-purple/5 transition-all duration-300"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h4 className="font-bold text-brand-black group-hover:text-brand-purple transition-colors mb-1 line-clamp-1">{item.name}</h4>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-charcoal/40 bg-gray-50 px-2 py-0.5 rounded">
              {item.type}
            </span>
          </div>
        </div>
        <div className="text-brand-charcoal/20 group-hover:text-brand-purple transition-colors mt-1">
          {isExternal ? <ExternalLink size={18} /> : <Download size={18} />}
        </div>
      </div>
    </a>
  );
}

function BenefitItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 bg-brand-purple/10 rounded-full flex items-center justify-center text-brand-purple border border-brand-purple/10">
        <CheckCircle2 size={14} />
      </div>
      <span className="text-sm font-bold text-brand-charcoal/80">{label}</span>
    </div>
  );
}
