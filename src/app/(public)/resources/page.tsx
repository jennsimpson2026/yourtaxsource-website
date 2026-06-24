import { 
  FileText, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  Search, 
  BookOpen, 
  Globe, 
  ShieldCheck,
  Star,
  ChevronRight,
  ArrowRight,
  Info
} from "lucide-react";
import Link from "next/link";
import { getPosts, getCategories } from "@/actions/resources";
import { ResourcesFAQ } from "@/components/ResourcesFAQ";

export const dynamic = 'force-dynamic';

export default async function ResourcesPage() {
  const categories = await getCategories();
  const allPosts = await getPosts({ status: 'published' });

  // Group resources by category
  const groupedResources = categories.map(cat => {
    const items = allPosts
      .filter(p => p.categoryId === cat.id)
      .map(p => {
        const isExternal = p.fileUrl?.startsWith('http') || p.slug.startsWith('http');
        return {
          id: p.id,
          name: p.title,
          description: p.content, // Using content as description if seoDescription is missing
          type: p.fileUrl ? (p.fileUrl.endsWith('.pdf') ? 'PDF' : p.fileUrl.endsWith('.xlsx') ? 'XLSX' : 'Link') : 'Info',
          date: new Date(p.publishDate || p.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          href: p.fileUrl || (isExternal ? p.slug : `/resources/${p.slug}`),
          isExternal
        };
      });

    return {
      title: cat.name,
      slug: cat.slug,
      description: cat.slug === 'checklists' ? "Prepare for your filing with these step-by-step guides." :
                   cat.slug === 'government-resources' ? "Official IRS and State Department of Revenue links." :
                   cat.slug === 'helpful-forms' ? "Commonly requested documents for individuals and businesses." :
                   "Helpful tools and information for your tax journey.",
      icon: cat.slug === 'checklists' ? <FileText className="text-brand-purple" size={24} /> :
            cat.slug === 'government-resources' ? <Globe className="text-brand-purple" size={24} /> :
            cat.slug === 'helpful-forms' ? <BookOpen className="text-brand-purple" size={24} /> :
            <FileText className="text-brand-purple" size={24} />,
      items
    };
  }).filter(section => section.items.length > 0);

  return (
    <div className="flex flex-col bg-white">
      {/* Boutique Header Section */}
      <section className="pt-20 pb-12 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-brand-purple mb-6">
            Resources Knowledge Center
          </h1>
          <p className="text-brand-charcoal/60 text-lg max-w-2xl mx-auto font-medium">
            Your one-stop hub for essential tax checklists, government resources,<br className="hidden md:block" />
            and helpful forms to keep you organized and informed.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="space-y-32">
          {groupedResources.map((section, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-100 pb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-brand-purple/5 rounded-[1.25rem] flex items-center justify-center border border-brand-purple/10 shadow-sm">
                    {section.icon}
                  </div>
                  <h2 className="text-4xl font-heading font-bold text-brand-black">{section.title}</h2>
                </div>
                <p className="text-brand-charcoal/60 max-w-md font-medium leading-relaxed">
                  {section.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((item, itemIdx) => (
                  <ResourceCard key={itemIdx} item={item} />
                ))}
              </div>
            </div>
          ))}

          {groupedResources.length === 0 && (
             <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-gray-100">
                <FileText className="mx-auto text-gray-200 mb-6" size={64} />
                <h3 className="text-2xl font-heading font-bold text-brand-black">No resources found</h3>
                <p className="text-brand-charcoal/60 mt-2">Check back soon for new guides and checklists.</p>
             </div>
          )}
        </div>
      </section>

      {/* TaxSource Tracker™ Section */}
      <section id="tracker" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-soft-gray/30 rounded-[3rem] border border-brand-lavender/30 p-8 md:p-16 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              {/* Mockup Preview */}
              <div className="relative order-2 lg:order-1">
                <div className="absolute -inset-4 bg-brand-purple/5 rounded-[3rem] blur-2xl"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden aspect-[4/3] flex flex-col">
                  {/* Mock Sidebar */}
                  <div className="flex flex-1">
                    <div className="w-16 md:w-24 bg-brand-black p-4 flex flex-col gap-4">
                      <div className="w-8 h-8 bg-brand-purple/20 rounded-lg mx-auto"></div>
                      <div className="w-8 h-2 bg-white/10 rounded-full mx-auto mt-4"></div>
                      <div className="w-8 h-2 bg-white/10 rounded-full mx-auto"></div>
                      <div className="w-8 h-2 bg-white/10 rounded-full mx-auto"></div>
                    </div>
                    {/* Mock Content */}
                    <div className="flex-1 p-6 md:p-8 bg-gray-50">
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <p className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-wider">Welcome back, Sarah!</p>
                          <p className="text-sm font-medium text-brand-charcoal/60 mt-1">Here's your tax journey overview</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                          <p className="text-[10px] uppercase font-bold text-brand-charcoal/40">Total Deductions</p>
                          <p className="text-xl font-bold text-brand-black mt-1">$12,450</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                          <p className="text-[10px] uppercase font-bold text-brand-charcoal/40">Documents</p>
                          <p className="text-xl font-bold text-brand-black mt-1">5 Uploaded</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-brand-purple rounded-full"></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-brand-charcoal/40 uppercase">
                          <span>My Progress</span>
                          <span>75%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="order-1 lg:order-2">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-brand-black mb-2">TaxSource Tracker™</h2>
                <p className="text-xl font-heading text-brand-purple italic mb-6">Your Tax Journey, Organized.</p>
                <p className="text-brand-charcoal/60 leading-relaxed mb-8 font-medium">
                  Our premium tracking tool helps you stay organized, upload documents, track deductions, and communicate with your tax pro — all in one place.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-10">
                  <BenefitItem label="Secure document upload & storage" />
                  <BenefitItem label="Direct messaging with your tax pro" />
                  <BenefitItem label="Track deductions & tax returns" />
                  <BenefitItem label="Mobile-friendly dashboard" />
                  <BenefitItem label="Real-time status updates" />
                  <BenefitItem label="Year-round access" />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-8 items-start lg:items-center">
                  <div className="flex flex-col gap-4">
                    <Link
                      href="https://stan.store/yourtaxsource"
                      className="inline-flex items-center justify-center gap-3 bg-brand-purple text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-brand-black transition-all shadow-xl shadow-brand-purple/20 hover:scale-105 active:scale-95"
                    >
                      <Download size={20} /> Order Tracker – $49
                    </Link>
                    <Link href="https://stan.store/yourtaxsource" target="_blank" className="text-xs text-brand-charcoal/40 hover:text-brand-purple transition-colors text-center font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      Powered by Stan Store <ExternalLink size={10} />
                    </Link>
                  </div>

                  {/* Testimonial */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-sm relative">
                    <div className="flex gap-1 text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-brand-charcoal/70 italic mb-4">
                      "This tool has completely changed how I manage my taxes. So easy and so organized!"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-lavender/30 rounded-full overflow-hidden flex items-center justify-center text-brand-purple font-bold">
                        SJ
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-black">— Sarah J.</p>
                        <p className="text-[10px] text-brand-charcoal/40 font-bold uppercase tracking-tighter">Small Business Owner</p>
                      </div>
                    </div>
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
              <ResourcesFAQ />
            </div>
          </div>
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
      target={isExternal || item.type === 'PDF' || item.type === 'XLSX' ? "_blank" : undefined}
      rel={isExternal || item.type === 'PDF' || item.type === 'XLSX' ? "noopener noreferrer" : undefined}
      className="group block bg-white border border-gray-100 p-8 rounded-[2rem] hover:border-brand-purple hover:shadow-2xl hover:shadow-brand-purple/10 transition-all duration-500 hover:-translate-y-1"
    >
      <div className="w-12 h-12 bg-brand-soft-gray rounded-2xl flex items-center justify-center text-brand-purple mb-6 group-hover:bg-brand-lavender transition-colors">
        <FileText size={24} />
      </div>
      
      <h4 className="text-xl font-heading font-bold text-brand-black group-hover:text-brand-purple transition-colors mb-3 leading-tight">{item.name}</h4>
      <p className="text-brand-charcoal/60 text-sm font-medium mb-8 flex-1 leading-relaxed line-clamp-3">{item.description}</p>
      
      <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-brand-charcoal/30 uppercase tracking-widest">Updated:</span>
          <span className="text-[10px] font-black text-brand-charcoal/50 uppercase tracking-widest">{item.date}</span>
        </div>
        <div className="text-brand-purple font-black uppercase tracking-widest text-[10px] flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {isExternal ? 'Visit' : 'Download'} <ArrowRight size={14} />
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
