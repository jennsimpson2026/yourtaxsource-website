import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock, Share2 } from "lucide-react";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // In a real app, we would fetch the post data based on the slug
  const post = {
    title: "5 Tax Planning Strategies for Small Business Owners in 2024",
    content: `
      <p>As we navigate through the 2024 tax year, small business owners face a unique set of challenges and opportunities. Proactive tax planning is not just about reducing your liability; it's about optimizing your financial health and ensuring your business is positioned for growth.</p>
      
      <h2>1. Maximize Section 179 Deductions</h2>
      <p>Section 179 of the IRS tax code allows businesses to deduct the full purchase price of qualifying equipment and software purchased or financed during the tax year. This is a powerful incentive for businesses to invest in themselves.</p>
      
      <h2>2. Review Your Business Structure</h2>
      <p>Is your business still operating under the most tax-efficient structure? As your revenue grows, transitioning from a Sole Proprietorship to an S-Corp or LLC could provide significant self-employment tax savings.</p>
      
      <h2>3. Implement a Robust Retirement Plan</h2>
      <p>Contributing to a SEP IRA or Solo 401(k) not only helps you save for the future but also provides immediate tax deductions for your business. For 2024, contribution limits have increased, offering even more potential for savings.</p>
      
      <h2>4. Leverage the Qualified Business Income (QBI) Deduction</h2>
      <p>Many small business owners and self-employed individuals can deduct up to 20% of their qualified business income from their total taxable income. Ensuring you meet the requirements for this deduction is essential.</p>
      
      <h2>5. Keep Immaculate Records</h2>
      <p>The foundation of effective tax planning is good bookkeeping. By staying organized throughout the year, you avoid the year-end scramble and ensure you don't miss out on valuable deductions like home office expenses, mileage, and professional development.</p>
    `,
    date: "June 15, 2024",
    author: "Jenn Simpson",
    authorTitle: "Founder & Lead Advisor",
    category: "Small Business",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1454165833767-027ffea9e7a7?q=80&w=1200&auto=format&fit=crop"
  };

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
            {post.category}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-8 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-400">
            <span className="flex items-center gap-2"><Calendar size={18} className="text-brand-purple" /> {post.date}</span>
            <span className="flex items-center gap-2"><Clock size={18} className="text-brand-purple" /> {post.readTime}</span>
            <span className="flex items-center gap-2"><User size={18} className="text-brand-purple" /> {post.author}</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 border border-gray-100">
          <img src={post.image} alt={post.title} className="w-full h-auto" />
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
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            <div className="mt-16 pt-10 border-t border-gray-100 flex flex-wrap justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-purple/20">
                  <img src="/jenn.jpg" alt={post.author} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-brand-black">{post.author}</p>
                  <p className="text-xs text-brand-charcoal/40 font-medium">{post.authorTitle}</p>
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
                <RelatedPost 
                  title="Understanding the New Clean Vehicle Credit" 
                  date="June 10, 2024" 
                  slug="clean-vehicle-credit-guide"
                />
                <RelatedPost 
                  title="How to Keep Your Books Audit-Ready" 
                  date="June 05, 2024" 
                  slug="audit-ready-bookkeeping"
                />
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
