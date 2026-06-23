import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock, Share2 } from "lucide-react";

export default async function BlogPostPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ preview?: string, id?: string }>
}) {
  const { slug } = await params;
  const { preview, id } = await searchParams;
  const isPreview = preview === "true" || preview === "1";

  // Sanitize slug - handle leading/trailing slashes and decode URI
  let cleanSlug = decodeURIComponent(slug);
  if (cleanSlug.startsWith("/")) cleanSlug = cleanSlug.substring(1);
  if (cleanSlug.endsWith("/")) cleanSlug = cleanSlug.substring(0, cleanSlug.length - 1);

  console.log(`[BLOG_POST] Fetching post slug: "${cleanSlug}" (original: "${slug}"), id: "${id}", isPreview: ${isPreview}`);

  const post = await db.query.posts.findFirst({
    where: id 
      ? eq(posts.id, id as string)
      : (isPreview 
          ? eq(posts.slug, cleanSlug)
          : and(eq(posts.slug, cleanSlug), eq(posts.status, "published"))
        ),
    with: {
      category: true,
      author: true,
    }
  });

  if (!post) {
    console.warn(`[BLOG_POST] Post not found for slug: "${cleanSlug}"`);
    // Try a case-insensitive fallback if possible
    notFound();
  }

  const displayPost = {
    title: post.title,
    content: post.content,
    date: post.publishDate ? new Date(post.publishDate).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString(),
    author: (post as any).author?.name || "Jenn Simpson",
    authorTitle: "Founder & Lead Advisor",
    category: (post as any).category?.name || "Uncategorized",
    readTime: `${Math.ceil(post.content.split(/\s+/).length / 200)} min read`,
    image: post.featuredImageUrl || "https://images.unsplash.com/photo-1454165833767-027ffea9e7a7?q=80&w=1200&auto=format&fit=crop"
  };

  const relatedPosts = await db.query.posts.findMany({
    where: and(eq(posts.status, "published"), eq(posts.categoryId, post.categoryId)),
    limit: 2,
    orderBy: (posts, { desc }) => [desc(posts.createdAt)]
  });

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-brand-black text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple opacity-20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-brand-lavender/60 hover:text-brand-purple font-bold text-sm mb-8 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Blog
          </Link>
          <div className="inline-block bg-brand-purple text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            {displayPost.category}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-8 leading-tight">
            {displayPost.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-400">
            <span className="flex items-center gap-2"><Calendar size={18} className="text-brand-purple" /> {displayPost.date}</span>
            <span className="flex items-center gap-2"><Clock size={18} className="text-brand-purple" /> {displayPost.readTime}</span>
            <span className="flex items-center gap-2"><User size={18} className="text-brand-purple" /> {displayPost.author}</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 border border-gray-100">
          <img src={displayPost.image} alt={displayPost.title} className="w-full h-auto" />
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1">
            <div 
              className="prose prose-lg prose-purple max-w-none 
                prose-headings:font-heading prose-headings:font-bold prose-headings:text-brand-black
                prose-p:text-brand-charcoal/80 prose-p:leading-relaxed
                prose-strong:text-brand-black prose-strong:font-bold
                prose-li:text-brand-charcoal/80"
              dangerouslySetInnerHTML={{ __html: displayPost.content }}
            />
            
            <div className="mt-16 pt-10 border-t border-gray-100 flex flex-wrap justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-purple/20">
                  <img src="/jenn.jpg" alt={displayPost.author} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-brand-black">{displayPost.author}</p>
                  <p className="text-xs text-brand-charcoal/40 font-medium">{displayPost.authorTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest mr-2">Share</span>
                <SocialIcon icon={<Share2 size={18} />} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 space-y-10">
            <div className="bg-brand-soft-gray p-8 rounded-3xl border border-gray-100">
              <h4 className="text-xl font-heading font-bold text-brand-black mb-4">Need Help?</h4>
              <p className="text-sm text-brand-charcoal/60 mb-6 leading-relaxed">
                Navigating small business taxes doesn't have to be overwhelming. Let's build a strategy that works for you.
              </p>
              <Link 
                href="/contact"
                className="block text-center bg-brand-purple text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all text-sm"
              >
                Book a Consultation
              </Link>
            </div>
            
            <div>
              <h4 className="text-lg font-heading font-bold text-brand-black mb-6">Related Articles</h4>
              <div className="space-y-6">
                {relatedPosts.map(rel => (
                  <RelatedPost 
                    key={rel.id}
                    title={rel.title} 
                    date={rel.publishDate ? new Date(rel.publishDate).toLocaleDateString() : "Recently"} 
                    slug={rel.slug}
                  />
                ))}
                {relatedPosts.length === 0 && <p className="text-xs text-gray-400">No related articles found.</p>}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand-charcoal/40 hover:text-brand-purple hover:bg-brand-lavender/30 transition-all">
      {icon}
    </button>
  );
}

function RelatedPost({ title, date, slug }: { title: string, date: string, slug: string }) {
  return (
    <Link href={`/blog/${slug}`} className="group block">
      <h5 className="font-bold text-brand-black group-hover:text-brand-purple transition-colors line-clamp-2 mb-1">{title}</h5>
      <p className="text-xs text-brand-charcoal/40 font-medium">{date}</p>
    </Link>
  );
}
