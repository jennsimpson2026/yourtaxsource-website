import { ArrowLeft, Calendar, User, Tag, Share2 } from "lucide-react";
import Link from "next/link";
import { getPostBySlug } from "@/actions/resources";
import { notFound } from "next/navigation";

export default async function ResourceDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-brand-black py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href="/resources" className="inline-flex items-center gap-2 text-brand-purple hover:text-white transition-colors mb-8 font-bold">
            <ArrowLeft size={20} /> Back to Resource Center
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-brand-purple/20 text-brand-purple px-4 py-1.5 rounded-full text-sm font-bold border border-brand-purple/30">
              {post.category.name}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-8 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-blue-100/60 font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-brand-purple" />
              {post.publishDate ? new Date(post.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Draft'}
            </div>
            <div className="flex items-center gap-2">
              <User size={18} className="text-brand-purple" />
              By {post.author.name}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg prose-brand max-w-none">
            {/* Split by newlines to handle basic markdown/text formatting */}
            {post.content.split('\n').map((line, idx) => {
              if (line.startsWith('### ')) {
                return <h3 key={idx} className="text-2xl font-heading font-bold text-brand-navy mt-12 mb-6">{line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('## ')) {
                return <h2 key={idx} className="text-3xl font-heading font-bold text-brand-navy mt-16 mb-8">{line.replace('## ', '')}</h2>;
              }
              if (line.startsWith('- ')) {
                return <li key={idx} className="text-brand-charcoal/80 mb-2 list-none flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-purple mt-2.5 shrink-0" />
                  {line.replace('- ', '')}
                </li>;
              }
              if (line.trim() === '') {
                return <br key={idx} />;
              }
              return <p key={idx} className="text-brand-charcoal/80 leading-relaxed mb-6">{line}</p>;
            })}
          </div>

          <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center text-white font-bold text-xl">
                {post.author.name?.[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-brand-navy">{post.author.name}</p>
                <p className="text-xs text-brand-charcoal/60">Your Tax Source Team</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-brand-navy rounded-xl font-bold hover:bg-gray-100 transition-all text-sm">
                <Share2 size={18} /> Share Resource
              </button>
              <Link href="/contact" className="flex items-center gap-2 px-6 py-3 bg-brand-purple text-white rounded-xl font-bold hover:bg-opacity-90 transition-all text-sm shadow-lg shadow-brand-purple/20">
                Ask a Question
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related/Next Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-brand-navy mb-4">Need more help?</h2>
          <p className="text-brand-charcoal/60 mb-10 max-w-lg mx-auto">
            Our portal is the best place to manage your documents and communicate directly with Jenn.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/login" className="bg-brand-navy text-white px-8 py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all">
              Client Login
            </Link>
            <Link href="/new-clients" className="bg-white text-brand-navy border border-gray-200 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all">
              New Client Info
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
