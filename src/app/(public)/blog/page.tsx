import { db } from "@/lib/db";
import { posts, categories } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";
import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Your Tax Source',
  description: 'Expert advice on tax planning, business growth, and financial confidence.',
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const dbPosts = await db.query.posts.findMany({
    where: and(
      eq(posts.status, "published"),
      eq(posts.type, "blog")
    ),
    with: {
      category: true,
      author: true,
    },
    orderBy: [desc(posts.publishDate)],
  });

  const dbCategories = await db.query.categories.findMany({
    with: {
      posts: true,
    }
  });

  const displayPosts = dbPosts.map(p => {
    // Clean content for excerpt
    let cleanContent = p.content
      .replace(/<[^>]*>/g, ' ') // Strip HTML tags
      .replace(/!\[.*?\]\(.*?\)/g, '') // Strip Markdown images
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Strip Markdown links but keep text
      .replace(/#{1,6}\s+/g, '') // Strip headers
      .replace(/(\*\*|__)(.*?)\1/g, '$2') // Strip bold
      .replace(/(\*|_)(.*?)\1/g, '$2') // Strip italic
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, '') // Strip code
      .replace(/>\s+/g, '') // Strip blockquotes
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    // Remove the title if it's at the start of the content
    if (cleanContent.toLowerCase().startsWith(p.title.toLowerCase())) {
      cleanContent = cleanContent.substring(p.title.length).trim();
      // Remove leading punctuation/formatting that might remain
      cleanContent = cleanContent.replace(/^[#\s:.-]+/, '').trim();
    }

    const excerpt = cleanContent.substring(0, 160) + (cleanContent.length > 160 ? "..." : "");

    return {
      id: p.id,
      title: p.title,
      excerpt,
      date: p.publishDate ? new Date(p.publishDate).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }) : "Recently Published",
      author: (p as any).author?.name || "Jenn Simpson",
      category: (p as any).category?.name || "Tax Tips",
      slug: p.slug,
      image: p.featuredImageUrl && p.featuredImageUrl.startsWith('http') ? p.featuredImageUrl : "/images/boutique-office.png"
    };
  });

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand-black text-white pt-24 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple opacity-20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-purple opacity-10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">Tax Tips & <span className="text-brand-purple italic">Strategic Insights</span></h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Expert advice on tax planning, business growth, and financial confidence from your partners at Your Tax Source.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        {displayPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {displayPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col h-full">
                {post.image ? (
                  <div className="relative h-64 w-full mb-8 overflow-hidden rounded-[2rem] shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img 
                      src={post.image} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      /* Broken image handler would need a client component, but we've filtered for valid http links */
                    />
                    <div className="absolute top-4 left-4 bg-brand-purple/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em]">
                      {post.category}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 flex flex-col gap-4">
                    <div className="inline-flex w-fit bg-brand-lavender/40 text-brand-purple px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em]">
                      {post.category}
                    </div>
                    {/* Collapsed image area - no spacer used */}
                  </div>
                )}
                
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-[10px] font-black text-brand-charcoal/30 uppercase tracking-[0.15em] mb-4">
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-brand-purple/40" /> {post.date}</span>
                    <span className="flex items-center gap-1.5"><User size={12} className="text-brand-purple/40" /> {post.author}</span>
                  </div>
                  
                  <h3 className="text-2xl font-heading font-bold text-brand-black group-hover:text-brand-purple transition-colors mb-4 line-clamp-2 leading-tight">
                    {post.title}
                  </h3>
                  
                  <p className="text-brand-charcoal/60 leading-relaxed mb-8 line-clamp-3 font-medium text-sm">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-auto flex items-center gap-2 text-brand-purple font-bold text-sm tracking-tight">
                    Read Article 
                    <div className="w-8 h-8 rounded-full bg-brand-lavender/30 flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-all">
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-brand-soft-gray/30 rounded-[3rem] border border-dashed border-brand-lavender/50">
            <h3 className="text-2xl font-heading font-bold text-brand-charcoal/30">Insights arriving soon.</h3>
            <p className="text-brand-charcoal/20 mt-2 font-medium">We're currently preparing fresh tax strategies for you.</p>
          </div>
        )}
      </section>

      {/* Categories & Newsletter */}
      <section className="py-24 bg-brand-soft-gray/50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-1 bg-brand-purple rounded-full"></div>
              <h2 className="text-3xl font-heading font-bold text-brand-black">Browse by Category</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dbCategories.length > 0 ? dbCategories.map(cat => (
                <CategoryLink key={cat.id} label={cat.name} count={cat.posts.length} slug={cat.slug} />
              )) : (
                <>
                  <CategoryLink label="Small Business Tax" count={0} />
                  <CategoryLink label="Individual Planning" count={0} />
                </>
              )}
            </div>
          </div>
          <div className="bg-brand-black p-12 md:p-16 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-heading font-bold mb-6">Stay Informed</h3>
              <p className="text-gray-400 mb-10 text-lg leading-relaxed font-medium">
                Get the latest tax tips and financial insights delivered directly to your inbox. Premium advice, zero noise.
              </p>
              <form className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 focus:ring-2 focus:ring-brand-purple outline-none transition-all placeholder:text-gray-600"
                />
                <button className="bg-brand-purple text-white px-10 py-5 rounded-2xl font-bold hover:bg-white hover:text-brand-black transition-all shadow-lg shadow-brand-purple/20">
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

function CategoryLink({ label, count, slug }: { label: string, count: number, slug?: string }) {
  return (
    <Link href={`/blog?category=${slug || '#'}`} className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 hover:border-brand-purple hover:shadow-xl transition-all group">
      <span className="font-bold text-brand-black group-hover:text-brand-purple transition-colors">{label}</span>
      <span className="text-[10px] font-black text-brand-charcoal/20 bg-brand-soft-gray px-3 py-1 rounded-full group-hover:bg-brand-lavender/30 group-hover:text-brand-purple transition-all">{count}</span>
    </Link>
  );
}
