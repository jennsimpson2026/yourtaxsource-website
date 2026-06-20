import { 
  FileText, 
  Globe, 
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Search,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { getPosts, getCategories } from "@/actions/resources";

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
    <div className="flex flex-col">
      <section className="bg-brand-black py-16 md:py-32 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-8">Resource <span className="text-brand-purple italic">Center</span>.</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Everything you need for a smooth tax experience. From checklists to official IRS links, 
            we've curated the most essential tools for our clients.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groupedResources.map((group, idx) => (
              <div key={idx} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    {group.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-brand-black">{group.category}</h2>
                  </div>
                </div>
                <p className="text-brand-charcoal/70 mb-8 text-sm">
                  {group.description}
                </p>
                
                <div className="space-y-4 flex-1">
                  {group.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="group/item">
                      <Link 
                        href={item.href}
                        target={item.isExternal ? "_blank" : undefined}
                        className="flex items-start justify-between p-4 bg-white rounded-2xl border border-transparent hover:border-brand-purple/20 hover:shadow-md transition-all"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-brand-navy group-hover/item:text-brand-purple transition-colors">
                              {item.name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-cloud text-brand-navy rounded-full uppercase tracking-wider">
                              {item.type}
                            </span>
                          </div>
                          <p className="text-xs text-brand-charcoal/60 line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 mt-1 group-hover/item:text-brand-purple group-hover/item:translate-x-1 transition-all" />
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Link href={`/resources?category=${group.slug}`} className="text-brand-purple font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                    View All {group.category} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Search/Help CTA */}
          <div className="mt-20 bg-brand-navy rounded-[2.5rem] p-8 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-purple/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-xl text-center md:text-left">
                <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4">Can't find what you're <span className="text-brand-purple italic">looking for?</span></h3>
                <p className="text-blue-100/70 text-lg">
                  Our team is here to help. Reach out with your specific questions or request a custom guide.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Link href="/contact" className="bg-brand-purple text-white px-8 py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all text-center flex items-center justify-center gap-2">
                  Contact Support <ArrowRight size={20} />
                </Link>
                <Link href="/faq" className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all text-center">
                  Search FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
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
    default:
      return <BookOpen className="text-brand-purple" size={24} />;
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
    default:
      return "Tax planning strategies and insights for individuals and businesses.";
  }
}
