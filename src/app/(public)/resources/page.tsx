import Link from "next/link";
import { 
  FileText, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  Search, 
  BookOpen, 
  Globe, 
  ShieldCheck 
} from "lucide-react";

const RESOURCES = [
  {
    category: "Tax Checklists",
    description: "Ensure you have everything ready before your appointment.",
    icon: <FileText className="text-brand-purple" size={24} />,
    items: [
      { name: "2024 Individual Tax Checklist", type: "PDF", size: "1.2 MB", href: "#" },
      { name: "Small Business / Freelancer Checklist", type: "PDF", size: "1.5 MB", href: "#" },
      { name: "Rental Property Income & Expense Sheet", type: "XLSX", size: "850 KB", href: "#" },
      { name: "Cryptocurrency Transaction Log", type: "PDF", size: "920 KB", href: "#" },
    ]
  },
  {
    category: "Government Links",
    description: "Official resources for federal and state tax information.",
    icon: <Globe className="text-brand-purple" size={24} />,
    items: [
      { name: "IRS.gov Official Website", type: "External", href: "https://www.irs.gov" },
      { name: "IRS: Where's My Refund?", type: "External", href: "https://www.irs.gov/refunds" },
      { name: "NC Department of Revenue", type: "External", href: "https://www.ncdor.gov" },
      { name: "Social Security Administration", type: "External", href: "https://www.ssa.gov" },
    ]
  },
  {
    category: "Useful Forms",
    description: "Commonly used tax and business forms for your reference.",
    icon: <BookOpen className="text-brand-purple" size={24} />,
    items: [
      { name: "Form W-9 (Request for TIN)", type: "PDF", href: "https://www.irs.gov/pub/irs-pdf/fw9.pdf" },
      { name: "Form W-4 (Employee Withholding)", type: "PDF", href: "https://www.irs.gov/pub/irs-pdf/fw4.pdf" },
      { name: "IRS Form 1040 (Sample)", type: "PDF", href: "https://www.irs.gov/pub/irs-pdf/f1040.pdf" },
    ]
  }
];

export default function ResourcesPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand-black text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple opacity-20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">Resources Knowledge <span className="text-brand-purple">Center</span></h1>
            <p className="text-xl text-gray-400 leading-relaxed mb-8">
              Everything you need to navigate your tax journey with confidence. Checklists, official government links, and essential tax documents.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-brand-lavender/60 uppercase tracking-widest">
                <CheckCircle2 size={16} className="text-brand-purple" /> Always Updated
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-brand-lavender/60 uppercase tracking-widest">
                <ShieldCheck size={16} className="text-brand-purple" /> Secure Downloads
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {RESOURCES.map((section, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-brand-lavender/30 rounded-2xl flex items-center justify-center">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-brand-black">{section.category}</h2>
                  <p className="text-brand-charcoal/60 text-sm">{section.description}</p>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {section.items.map((item, itemIdx) => (
                  <ResourceCard key={itemIdx} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TaxSource Tracker Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-purple/10 rounded-[3rem] -rotate-2"></div>
              <div className="relative bg-brand-soft-gray p-8 rounded-[3rem] border border-gray-100 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-brand-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-brand-purple">
                    <Search size={40} />
                  </div>
                  <p className="font-bold text-brand-black">TaxSource Tracker™ Dashboard Preview</p>
                  <p className="text-xs text-brand-charcoal/40 uppercase tracking-widest mt-2 font-black">Coming Soon</p>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                Featured Resource
              </div>
              <h2 className="text-4xl font-heading font-bold text-brand-black mb-6">TaxSource Tracker™</h2>
              <p className="text-xl text-brand-charcoal/60 leading-relaxed mb-8">
                The ultimate organizational tool for entrepreneurs and small business owners. Stop wondering where your documents are and start tracking your tax readiness in real-time.
              </p>
              
              <div className="space-y-6 mb-10">
                <BenefitItem label="Real-time document status tracking" />
                <BenefitItem label="Direct integration with your tax professional" />
                <BenefitItem label="Secure, encrypted 24/7 access" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-brand-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-purple transition-all shadow-lg">
                  Purchase Tracker ($49)
                </button>
                <div className="bg-brand-lavender/30 px-6 py-4 rounded-2xl border border-brand-purple/10">
                  <p className="text-xs font-medium text-brand-charcoal/80">
                    "This tool saved me 20+ hours during tax season. A must-have!"
                    <span className="block mt-1 font-bold text-brand-purple">— Sarah J., Small Business Owner</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tracker FAQ Section */}
          <div className="mt-20 max-w-4xl mx-auto">
            <h3 className="text-2xl font-heading font-bold text-brand-black mb-10 text-center">TaxSource Tracker™ FAQ</h3>
            <div className="space-y-4">
              <FaqItem 
                question="What is the TaxSource Tracker™?" 
                answer="It is a proprietary digital dashboard and organizational system designed by Jennifer Simpson to help clients categorize, track, and manage their tax documentation throughout the year."
              />
              <FaqItem 
                question="How do I get access?" 
                answer="The tracker is included for all 'Boutique Advisory' clients. It can also be purchased as a standalone resource for individuals and businesses who want to improve their organization."
              />
              <FaqItem 
                question="Is my data secure in the tracker?" 
                answer="Yes. The tracker uses the same bank-grade 256-bit encryption as our main Secure Client Portal, ensuring your financial data remains private and protected."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-20 bg-brand-soft-gray">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="text-3xl font-heading font-bold text-brand-black mb-6">Can't find what you're looking for?</h3>
            <p className="text-brand-charcoal/60 text-lg mb-10 max-w-2xl mx-auto">
              Our team is here to help. If you have specific questions about a tax form or requirement, please don't hesitate to reach out.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 bg-brand-purple text-white px-10 py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-brand-purple/20"
            >
              Contact Our Office <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ResourceCard({ item }: { item: any }) {
  const isExternal = item.type === "External";
  
  return (
    <a 
      href={item.href} 
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group block bg-white border border-gray-100 p-5 rounded-2xl hover:border-brand-purple hover:shadow-xl hover:shadow-brand-purple/5 transition-all"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h4 className="font-bold text-brand-black group-hover:text-brand-purple transition-colors mb-1">{item.name}</h4>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-charcoal/40 bg-gray-50 px-2 py-0.5 rounded">
              {item.type}
            </span>
            {item.size && (
              <span className="text-[10px] font-bold text-brand-charcoal/30">
                {item.size}
              </span>
            )}
          </div>
        </div>
        <div className="text-brand-charcoal/20 group-hover:text-brand-purple transition-colors">
          {isExternal ? <ExternalLink size={18} /> : <Download size={18} />}
        </div>
      </div>
    </a>
  );
}

function BenefitItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 bg-brand-purple/10 rounded-full flex items-center justify-center text-brand-purple">
        <CheckCircle2 size={12} />
      </div>
      <span className="text-sm font-medium text-brand-charcoal/80">{label}</span>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-all"
      >
        <span className="font-bold text-brand-black">{question}</span>
        <ChevronRight className={`text-brand-purple transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} size={20} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
        <div className="p-6 pt-0 text-sm text-brand-charcoal/60 leading-relaxed border-t border-gray-50">
          {answer}
        </div>
      </div>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
