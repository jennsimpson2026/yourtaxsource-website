import React from "react";
import { db } from "@/lib/db";
import { posts, categories } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { 
  Plus, 
  FileEdit, 
  CheckCircle2,
  Eye,
  FileText
} from "lucide-react";
import Link from "next/link";
import { BlogCMSTable } from "@/components/admin/BlogCMSTable";

export default async function BlogCMSPage() {
  console.log("[BLOG_CMS] Loading BlogCMSPage...");
  const dbPosts = await db.query.posts.findMany({
    where: eq(posts.type, "blog"),
    with: {
      category: true,
      author: true,
    },
    orderBy: [desc(posts.createdAt)],
  });
  console.log(`[BLOG_CMS] Found ${dbPosts.length} posts`);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-brand-black">Blog CMS</h1>
          <p className="text-brand-charcoal/60 text-sm">Manage your tax tips, insights, and news articles.</p>
        </div>
        <Link 
          href="/admin/blog/new"
          className="bg-brand-purple text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-brand-purple/20"
        >
          <Plus size={20} /> Create New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Posts" value={dbPosts.length.toString()} icon={<FileText className="text-brand-purple" />} />
        <StatCard title="Published" value={dbPosts.filter(p => p.status === 'published').length.toString()} icon={<CheckCircle2 className="text-green-500" />} />
        <StatCard title="Public URL" value="/blog" icon={<Eye className="text-blue-500" />} />
      </div>

      {/* Table Section */}
      <BlogCMSTable initialPosts={dbPosts} />
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-heading font-bold text-brand-black">{value}</p>
      </div>
    </div>
  );
}
