import {
  FileText,
  Globe,
  ShieldCheck,
  Star,
  ChevronRight,
  ArrowRight,
  Search,
  BookOpen,
  ExternalLink,
  Download,
  CheckCircle2,
  Info
} from "lucide-react";
import Link from "next/link";
import { getPosts, getCategories } from "@/actions/resources";
import { ResourcesFAQ } from "@/components/ResourcesFAQ";

export const dynamic = 'force-dynamic';

export default async function ResourcesPage() {
  const categories = await getCategories();
  const allPosts = await getPosts({ status: 'published' });

  // Map to desired display categories
  const checklistCat = categories.find(c => c.slug === 'checklists');
  const govCat = categories.find(c => c.slug === 'government-resources');
  const formsCat = categories.find(c => c.slug === 'helpful-forms' || c.slug === 'useful-forms');

  // Helper to get items for a category
  const getItemsByCatId = (id: string | undefined) => {
    if (!id) return [];
    return allPosts
      .filter(p => p.categoryId === id)
      .map(p => {
        const fileUrl = p.fileUrl;
        const isDirectLink = !!fileUrl || p.featuredImageUrl?.startsWith('http');
        const isExternalSlug = p.slug.startsWith('http');
        
        // Detect type from file extension
        let displayType = "PDF";
        if (p.categoryId === govCat?.id) {
          displayType = "External";
        } else if (fileUrl) {
          const ext = fileUrl.split('.').pop()?.toLowerCase();
          if (ext === 'xlsx' || ext === 'xls') displayType = "Excel";
          else if (ext === 'docx' || ext === 'doc') displayType = "Word";
          else if (ext === 'pdf') displayType = "PDF";
          else displayType = "File";
        } else if (isDirectLink) {
          displayType = "File";
        }

        return {
          id: p.id,
          name: p.title,
          description: p.seoDescription || "",
          type: displayType,
          href: fileUrl || (isDirectLink ? p.featuredImageUrl! : (isExternalSlug ? p.slug : `/resources/${p.slug}`)),
          isExternal: (p.categoryId === govCat?.id) || isDirectLink || isExternalSlug,
          isDownload: !!fileUrl
        };
      });
  };

  const checklists = getItemsByCatId(checklistCat?.id);
  const governmentResources = getItemsByCatId(govCat?.id);
  const helpfulForms = getItemsByCatId(formsCat?.id);

  // Manual ordering for checklists
  const orderedChecklists = [...checklists].sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const target = "tax appointment";
    if (aName.includes(target) && !bName.includes(target)) return -1;
    if (!aName.includes(target) && bName.includes(target)) return 1;
    return a.name.localeCompare(b.name);
  });

  const displaySections = [
    { 
      title: "Tax Checklists", 
      description: "Stay prepared and organized with our comprehensive checklists for every stage of your tax journey.", 
      icon: <FileText className="text-brand-purple" size={24} />,
      items: orderedChecklists,
      slug: 'checklists',
      buttonText: "View All Checklists"
    },
    { 
      title: "Government Resources", 
      description: "Official links to federal and state tax resources and helpful government websites.", 
      icon: <Globe className="text-brand-purple" size={24} />,
      items: governmentResources,
      slug: 'government-resources',
      buttonText: "View All Resources"
    },
    { 
      title: "Helpful Forms", 
      description: "Commonly used tax and business forms ready for download.", 
      icon: <BookOpen className="text-brand-purple" size={24} />,
      items: helpfulForms,
      slug: 'helpful-forms',
      buttonText: "View All Forms"
    }
  ].filter(s => s.items.length > 0);

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

      {/* Main Grid Content */}
      <section className="pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {displaySections.map((section, idx) => (
              <div key={idx} className="flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-brand-lavender/20 rounded-2xl flex items-center justify-center border border-brand-purple/10">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-brand-black">{section.title}</h2>
                </div>
                <p className="text-sm text-brand-charcoal/60 mb-8 font-medium leading-relaxed">
                  {section.description}
                </p>
                <div className="space-y-4 flex-1">
                  {section.items.map((item, itemIdx) => (
                    <ResourceCard key={itemIdx} item={item} sectionSlug={section.slug || ""} />
                  ))}
                </div>
                {section.slug && (
                  <div className="mt-8">
                    <Link
                      href={`/resources/category/${section.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 border border-brand-purple/20 text-brand-purple py-3 rounded-2xl font-bold hover:bg-brand-lavender/10 transition-all"
                    >
                      {section.buttonText} <ChevronRight size={16} />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
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
          </div>
          
          <div className="mt-24">
            <ResourcesFAQ />
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

function ResourceCard({ item, sectionSlug }: { item: any; sectionSlug: string }) {
  const isExternal = item.isExternal;
  let Icon = FileText;
  if (sectionSlug === 'government-resources') Icon = Globe;
  if (sectionSlug === 'helpful-forms' || sectionSlug === 'useful-forms') Icon = BookOpen;

  return (
    <a
      href={item.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group block bg-white border border-gray-100 p-5 rounded-2xl hover:border-brand-purple hover:shadow-xl hover:shadow-brand-purple/5 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-brand-soft-gray rounded-xl flex items-center justify-center text-brand-purple shrink-0 group-hover:bg-brand-lavender transition-colors">
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-brand-black group-hover:text-brand-purple transition-colors leading-tight">
              {item.name}
            </h4>
            {item.type && item.type !== "File" && item.type !== "Info" && (
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-purple bg-brand-lavender/40 px-1.5 py-0.5 rounded-md">
                {item.type}
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-brand-charcoal/60 leading-relaxed font-medium mt-1">
              {item.description}
            </p>
          )}
        </div>
        <div className="text-brand-charcoal/20 group-hover:text-brand-purple transition-colors mt-1">
          {item.isDownload ? (
            <Download size={18} />
          ) : isExternal ? (
            <ExternalLink size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
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
