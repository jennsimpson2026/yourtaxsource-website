"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  Search, 
  BookOpen, 
  Globe, 
  ShieldCheck,
  ChevronRight,
  ArrowRight
} from "lucide-react";

const RESOURCES = [
  {
    category: "Essential Checklists",
    description: "Prepare for your filing with these step-by-step guides.",
    icon: <FileText className="text-brand-purple" size={24} />,
    items: [
      { 
        name: "What Do I Need For My Tax Appointment?", 
        description: "A master list of every document needed for a smooth filing experience.",
        type: "PDF", 
        date: "May 2024",
        href: "#" 
      },
      { 
        name: "2024 Individual Tax Checklist", 
        description: "Standard checklist for families and single filers.",
        type: "PDF", 
        date: "Jan 2024",
        href: "#" 
      },
      { 
        name: "Small Business / Freelancer Checklist", 
        description: "Specific items for Schedule C filers and small corporations.",
        type: "PDF", 
        date: "Feb 2024",
        href: "#" 
      },
      { 
        name: "Rental Property Income & Expense Sheet", 
        description: "Organize your rental income and allowable deductions.",
        type: "XLSX", 
        date: "Jan 2024",
        href: "#" 
      },
      { 
        name: "Cryptocurrency Transaction Log", 
        description: "Template for recording trades and basis for digital assets.",
        type: "PDF", 
        date: "Dec 2023",
        href: "#" 
      },
    ]
  },
  {
    category: "Government Resources",
    description: "Official IRS and State Department of Revenue links.",
    icon: <Globe className="text-brand-purple" size={24} />,
    items: [
      { 
        name: "IRS.gov Official Website", 
        description: "The main hub for federal tax information and forms.",
        type: "External", 
        date: "Daily",
        href: "https://www.irs.gov" 
      },
      { 
        name: "IRS: Where's My Refund?", 
        description: "Track the status of your federal income tax refund.",
        type: "External", 
        date: "Daily",
        href: "https://www.irs.gov/refunds" 
      },
      { 
        name: "Health Care Marketplace (1095-A)", 
        description: "Access your health insurance marketplace statements.",
        type: "External", 
        date: "2024",
        href: "https://www.healthcare.gov/login" 
      },
      { 
        name: "Make a Federal Tax Payment", 
        description: "Securely pay your taxes online directly to the IRS.",
        type: "External", 
        date: "Daily",
        href: "https://www.irs.gov/payments" 
      },
      { 
        name: "IRS Estimated Tax Payments", 
        description: "Information and payment portal for quarterly estimates.",
        type: "External", 
        date: "Daily",
        href: "https://www.irs.gov/payments/direct-pay" 
      },
      { 
        name: "NC DOR: Make a Payment", 
        description: "Official portal for North Carolina state tax payments.",
        type: "External", 
        date: "Daily",
        href: "https://www.ncdor.gov/file-pay/make-payment" 
      },
    ]
  },
  {
    category: "Useful Tax Forms",
    description: "Commonly requested documents for individuals and businesses.",
    icon: <BookOpen className="text-brand-purple" size={24} />,
    items: [
      { 
        name: "Form W-4 (Employee Withholding)", 
        description: "Ensure your employer is withholding the correct amount.",
        type: "PDF", 
        date: "2024",
        href: "https://www.irs.gov/pub/irs-pdf/fw4.pdf" 
      },
      { 
        name: "Form 1099-MISC", 
        description: "Sample form for miscellaneous income reporting.",
        type: "PDF", 
        date: "2024",
        href: "https://www.irs.gov/pub/irs-pdf/f1099msc.pdf" 
      },
      { 
        name: "Form 1040 (U.S. Individual Sample)", 
        description: "Reference copy of the standard individual tax return.",
        type: "PDF", 
        date: "2023",
        href: "https://www.irs.gov/pub/irs-pdf/f1040.pdf" 
      },
      { 
        name: "Form 2210 (Estimated Tax Underpayment)", 
        description: "Form used to calculate penalties for underpayment.",
        type: "PDF", 
        date: "2023",
        href: "https://www.irs.gov/pub/irs-pdf/f2210.pdf" 
      },
      { 
        name: "Form 843 (Penalty Abatement)", 
        description: "Request for abatement of penalties or interest.",
        type: "PDF", 
        date: "2024",
        href: "https://www.irs.gov/pub/irs-pdf/f843.pdf" 
      },
      { 
        name: "Form W-9 (Request for TIN)", 
        description: "Standard form used to provide your TIN to others.",
        type: "PDF", 
        date: "Mar 2024",
        href: "https://www.irs.gov/pub/irs-pdf/fw9.pdf" 
      },
    ]
  }
];

const FUTURE_RESOURCES = [
  "Welcome Packet",
  "Tax Organizer",
  "Expense Tracker",
  "Mileage Log",
  "Home Office Worksheet",
  "Rental Summary",
  "Estimated Tax Guide",
  "Document Checklist",
  "Record Retention Guide",
  "First-Time Business Guide"
];

export default function ResourcesPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand-black text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple opacity-20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 tracking-tight">Resources Knowledge <span className="text-brand-purple">Center</span></h1>
            <p className="text-xl text-gray-400 leading-relaxed mb-8 font-medium">
              Everything you need to navigate your tax journey with confidence. Checklists, official government links, and essential tax documents.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm font-bold text-brand-lavender/60 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <CheckCircle2 size={16} className="text-brand-purple" /> Always Updated
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-brand-lavender/60 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <ShieldCheck size={16} className="text-brand-purple" /> Secure Access
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="space-y-32">
          {RESOURCES.map((section, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-100 pb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-brand-purple/5 rounded-[1.25rem] flex items-center justify-center border border-brand-purple/10 shadow-sm">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-heading font-bold text-brand-black mb-1">{section.category}</h2>
                    <p className="text-brand-charcoal/60 font-medium">{section.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((item, itemIdx) => (
                  <ResourceCard key={itemIdx} item={item} />
                ))}
              </div>
            </div>
          ))}

          {/* Future Placeholders Grid */}
          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-100 pb-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gray-50 rounded-[1.25rem] flex items-center justify-center border border-gray-100 shadow-sm">
                  <BookOpen className="text-gray-400" size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-heading font-bold text-brand-black mb-1">Coming Soon</h2>
                  <p className="text-brand-charcoal/60 font-medium">We're constantly adding new tools to our self-service library.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {FUTURE_RESOURCES.map((name, idx) => (
                <div key={idx} className="bg-brand-soft-gray/30 border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-60">
                   <h4 className="font-bold text-brand-charcoal/80 text-sm">{name}</h4>
                   <p className="text-[10px] text-brand-purple font-black uppercase tracking-widest mt-2">Developing</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TaxSource Tracker Section */}
      <section className="py-24 bg-brand-soft-gray">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-[3.5rem] p-8 md:p-20 shadow-xl border border-gray-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple/5 rounded-full -mr-32 -mt-32"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-purple/5 rounded-[3rem] -rotate-3 scale-105"></div>
                <div className="relative bg-brand-soft-gray p-8 rounded-[3rem] border border-gray-100 aspect-video flex items-center justify-center shadow-inner overflow-hidden">
                  <div className="text-center group">
                    <div className="w-24 h-24 bg-brand-purple/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-brand-purple shadow-sm group-hover:scale-110 transition-transform duration-500">
                      <Search size={48} />
                    </div>
                    <p className="font-bold text-brand-black text-xl mb-1">TaxSource Tracker™</p>
                    <p className="text-[10px] text-brand-purple font-black uppercase tracking-[0.2em] bg-brand-purple/5 px-3 py-1 rounded-full">Interactive Dashboard Preview</p>
                  </div>
                  {/* Subtle decorative elements */}
                  <div className="absolute top-10 right-10 w-2 h-2 bg-brand-purple/20 rounded-full"></div>
                  <div className="absolute bottom-20 left-12 w-4 h-4 bg-brand-purple/10 rounded-full"></div>
                </div>
              </div>
              
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-lavender/50 text-brand-purple rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-brand-purple/10">
                  <Star className="w-3 h-3 fill-brand-purple" /> Featured Tool
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-brand-black mb-8 leading-tight">Master Your Tax Organization</h2>
                <p className="text-xl text-brand-charcoal/60 leading-relaxed mb-10 font-medium">
                  The ultimate organizational tool for entrepreneurs and small business owners. Stop wondering where your documents are and start tracking your tax readiness in real-time.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                  <BenefitItem label="Real-time document status" />
                  <BenefitItem label="Professional integration" />
                  <BenefitItem label="Secure encrypted access" />
                  <BenefitItem label="Year-round planning" />
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <button className="w-full md:w-auto bg-brand-black text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-brand-purple transition-all shadow-xl hover:scale-105 active:scale-95">
                    Order Tracker ($49)
                  </button>
                  <div className="flex items-center gap-4 bg-brand-purple/5 px-6 py-4 rounded-2xl border border-brand-purple/10 italic">
                    <p className="text-sm font-bold text-brand-charcoal/70">
                      "Essential for every small business owner."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Sub-section */}
            <div className="mt-24 max-w-4xl">
              <h3 className="text-2xl font-heading font-bold text-brand-black mb-10 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-brand-purple rounded-full"></div>
                Common Questions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FaqItem 
                  question="What is the Tracker?" 
                  answer="A proprietary digital system designed by Jenn Simpson to help you manage tax documents throughout the year."
                />
                <FaqItem 
                  question="How do I get it?" 
                  answer="Included for Boutique Advisory clients, or available as a standalone purchase for any business."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="bg-brand-black p-12 md:p-20 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-purple/5 opacity-50"></div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-5xl font-heading font-bold text-white mb-8">Can't find what you're looking for?</h3>
              <p className="text-brand-lavender text-xl mb-12 max-w-2xl mx-auto font-medium opacity-80">
                Our team is here to help. If you have specific questions about a tax form or requirement, please don't hesitate to reach out.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link 
                  href="/contact"
                  className="bg-brand-purple text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-white hover:text-brand-purple transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-wider"
                >
                  Contact Our Office
                </Link>
                <Link 
                  href="/portal"
                  className="bg-white/10 text-white backdrop-blur-md border border-white/20 px-12 py-5 rounded-2xl font-black text-lg hover:bg-white/20 transition-all shadow-xl"
                >
                  Client Portal Login
                </Link>
              </div>
            </div>
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
      className="group block bg-white border border-gray-100 p-8 rounded-[2rem] hover:border-brand-purple hover:shadow-2xl hover:shadow-brand-purple/10 transition-all duration-500 hover:-translate-y-1"
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3 rounded-2xl ${isExternal ? 'bg-blue-50 text-blue-600' : 'bg-brand-purple/5 text-brand-purple'} group-hover:bg-brand-purple group-hover:text-white transition-colors duration-500`}>
            {isExternal ? <Globe size={24} /> : <FileText size={24} />}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-gray-50 text-brand-charcoal/40 rounded-full border border-gray-100">
              {item.type}
            </span>
          </div>
        </div>
        
        <h4 className="text-xl font-heading font-bold text-brand-black group-hover:text-brand-purple transition-colors mb-3 leading-tight">{item.name}</h4>
        <p className="text-brand-charcoal/60 text-sm font-medium mb-8 flex-1 leading-relaxed">{item.description}</p>
        
        <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-brand-charcoal/30 uppercase tracking-widest">Updated:</span>
            <span className="text-[10px] font-black text-brand-charcoal/50 uppercase tracking-widest">{item.date}</span>
          </div>
          <div className="text-brand-purple font-black uppercase tracking-widest text-[10px] flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isExternal ? 'Visit' : 'Download'} <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </a>
  );
}

function BenefitItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-6 h-6 bg-brand-purple/10 rounded-full flex items-center justify-center text-brand-purple">
        <CheckCircle2 size={14} />
      </div>
      <span className="text-sm font-bold text-brand-charcoal/80">{label}</span>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50 hover:bg-white transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex justify-between items-center transition-all"
      >
        <span className="font-bold text-brand-black text-sm">{question}</span>
        <ChevronRight className={`text-brand-purple transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} size={18} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
        <div className="p-6 pt-0 text-xs text-brand-charcoal/60 leading-relaxed border-t border-gray-100">
          {answer}
        </div>
      </div>
    </div>
  );
}

const Star = ({ className, ...props }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);