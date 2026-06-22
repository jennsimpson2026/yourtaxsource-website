import {
  FileText,
  Globe,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Search,
  BookOpen,
  LayoutGrid,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  Download
} from "lucide-react";
import Link from "next/link";
import { getPosts, getCategories } from "@/actions/resources";
import { ResourcesFAQ } from "@/components/ResourcesFAQ";

export default async function ResourcesPage() {
  const categories = await getCategories();
  const posts = await getPosts({ status: 'published' });

  // Group posts by category
  const groupedResources = categories.map(category => {
    const categoryPosts = posts.filter(post => post.categoryId === category.id);
    return {
      category: category.name,
      slug: category.slug,
      description: getCategoryDescription(category.slug),
      icon: getCategoryIcon(category.slug),
      items: categoryPosts.map(post => ({
        name: post.title,
        description: post.content.substring(0, 100).replace(/[#*`]/g, '') + '...',
        type: post.categoryId === categories.find(c => c.slug === 'government-resources')?.id ? "External" : "Article",
        date: post.publishDate ? new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A',
        href: `/resources/${post.slug}`,
        isExternal: post.categoryId === categories.find(c => c.slug === 'government-resources')?.id
      }))
    };
  }).filter(group => group.items.length > 0);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand-black text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple opacity-20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 tracking-tight">
              Resources Knowledge <span className="text-brand-purple">Center</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed mb-8">
              Everything you need for a smooth tax experience. From checklists to official government links, 
              we've curated the most essential tools for our clients.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-brand-lavender/60 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <CheckCircle2 size={16} className="text-brand-purple" /> Always Updated
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-brand-lavender/60 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <ShieldCheck size={16} className="text-brand-purple" /> Secure Downloads
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {groupedResources.map((group, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-brand-lavender/30 rounded-2xl flex items-center justify-center border border-brand-purple/10 shadow-sm">
                  {group.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-brand-black">{group.category}</h2>
                  <p className="text-brand-charcoal/60 text-sm font-medium">{group.description}</p>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {group.items.slice(0, 5).map((item, itemIdx) => (
                  <ResourceCard key={itemIdx} item={item} />
                ))}
              </div>

              {group.items.length > 5 && (
                <div className="mt-6">
                  <Link href={`/resources?category=${group.slug}`} className="text-brand-purple font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                    View All {group.category} <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* TaxSource Tracker Section */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-purple/10 rounded-[3rem] -rotate-2"></div>
              <div className="relative bg-brand-soft-gray p-8 rounded-[3rem] border border-gray-100 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-brand-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-brand-purple shadow-sm">
                    <Search size={40} />
                  </div>
                  <p className="font-bold text-brand-black">TaxSource Tracker™ Dashboard Preview</p>
                  <p className="text-xs text-brand-charcoal/40 uppercase tracking-widest mt-2 font-black">Coming Soon</p>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-brand-purple/10">
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
                <button className="w-full sm:w-auto bg-brand-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-purple transition-all shadow-lg">
                  Purchase Tracker ($49)
                </button>
                <div className="bg-brand-lavender/30 px-6 py-4 rounded-2xl border border-brand-purple/10">
                  <p className="text-xs font-medium text-brand-charcoal/80">
                    "This tool saved me 20+ hours during tax season. A must-have!"
                    <span className="block mt-1 font-bold text-brand-purple text-[10px]">— Sarah J., Small Business Owner</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ResourcesFAQ />
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-24 bg-brand-soft-gray">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-xl border border-gray-100">
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
                Browse All FAQs
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
            <span className="text-[10px] font-bold text-brand-charcoal/30">
              {item.date}
            </span>
          </div>
        </div>
        <div className="text-brand-charcoal/20 group-hover:text-brand-purple transition-colors mt-1">
          {isExternal ? <ExternalLink size={18} /> : <ArrowRight size={18} />}
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

function getCategoryIcon(slug: string) {
  switch (slug) {
    case 'checklists':
      return <FileText className="text-brand-purple" size={24} />;
    case 'government-resources':
      return <Globe className="text-brand-purple" size={24} />;
    case 'faq':
      return <ShieldCheck className="text-brand-purple" size={24} />;
    case 'tax-organizers':
      return <BookOpen className="text-brand-purple" size={24} />;
    case 'client-info':
      return <LayoutGrid className="text-brand-purple" size={24} />;
    case 'billing-info':
      return <CreditCard className="text-brand-purple" size={24} />;
    default:
      return <FileText className="text-brand-purple" size={24} />;
  }
}

function getCategoryDescription(slug: string) {
  switch (slug) {
    case 'checklists':
      return "Prepare for your filing with these step-by-step guides and master lists.";
    case 'government-resources':
      return "Official IRS and State Department of Revenue links and payment portals.";
    case 'faq':
      return "Quick answers to common questions about our services and security.";
    case 'tax-organizers':
      return "Downloadable packets, forms, and organizers to streamline your tax preparation.";
    case 'client-info':
      return "Important information on how to work with us, upload documents, and track status.";
    case 'billing-info':
      return "Details on our service fees, payment methods, and billing policies.";
    default:
      return "Essential tools and guides for your tax and financial planning needs.";
  }
}
