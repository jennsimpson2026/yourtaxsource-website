import Link from "next/link";
import { ArrowRight, Calendar, User, Tag, ChevronRight } from "lucide-react";

const BLOG_POSTS = [
  {
    title: "5 Tax Planning Strategies for Small Business Owners in 2024",
    excerpt: "Maximize your deductions and prepare for the upcoming tax season with these essential tips.",
    date: "June 15, 2024",
    author: "Jenn Simpson",
    category: "Small Business",
    slug: "tax-planning-strategies-2024",
    image: "https://images.unsplash.com/photo-1454165833767-027ffea9e7a7?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Understanding the New Clean Vehicle Credit",
    excerpt: "What you need to know about qualifying for the federal tax credit when purchasing an EV.",
    date: "June 10, 2024",
    author: "Jenn Simpson",
    category: "Individual Tax",
    slug: "clean-vehicle-credit-guide",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "How to Keep Your Books Audit-Ready All Year Round",
    excerpt: "Best practices for document retention and financial record-keeping for entrepreneurs.",
    date: "June 05, 2024",
    author: "Jenn Simpson",
    category: "Bookkeeping",
    slug: "audit-ready-bookkeeping",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop"
  }
];

export default function BlogPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand-black text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple opacity-20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">Tax Tips & <span className="text-brand-purple">Insights</span></h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Expert advice on tax planning, business growth, and financial confidence from your partners at Your Tax Source.
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {BLOG_POSTS.map((post, idx) => (
            <Link key={idx} href={`/blog/${post.slug}`} className="group flex flex-col">
              <div className="relative h-64 w-full mb-6 overflow-hidden rounded-3xl">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-brand-purple text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  {post.category}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest mb-3">
                <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
                <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>
              </div>
              <h3 className="text-2xl font-heading font-bold text-brand-black group-hover:text-brand-purple transition-colors mb-4 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-brand-charcoal/60 leading-relaxed mb-6 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="mt-auto flex items-center gap-2 text-brand-purple font-bold text-sm">
                Read Article <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories & Newsletter */}
      <section className="py-20 bg-brand-soft-gray">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <h2 className="text-3xl font-heading font-bold text-brand-black mb-10">Browse by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CategoryLink label="Small Business Tax" count={12} />
              <CategoryLink label="Individual Planning" count={8} />
              <CategoryLink label="IRS Updates" count={15} />
              <CategoryLink label="Bookkeeping Tips" count={6} />
              <CategoryLink label="Wealth Building" count={4} />
              <CategoryLink label="Tax Deadlines" count={9} />
            </div>
          </div>
          <div className="bg-brand-black p-12 rounded-[3rem] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-purple opacity-20 rounded-full -mr-20 -mt-20"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-heading font-bold mb-6">Stay Informed</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Get the latest tax tips and financial insights delivered directly to your inbox once a month. No spam, just value.
              </p>
              <form className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple outline-none"
                />
                <button className="bg-brand-purple text-white px-8 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryLink({ label, count }: { label: string, count: number }) {
  return (
    <Link href="#" className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 hover:border-brand-purple hover:shadow-lg transition-all group">
      <span className="font-bold text-brand-black group-hover:text-brand-purple transition-colors">{label}</span>
      <span className="text-xs font-bold text-brand-charcoal/30 bg-gray-50 px-2 py-1 rounded-full">{count}</span>
    </Link>
  );
}
