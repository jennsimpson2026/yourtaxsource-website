import { db } from "@/lib/db";
import { posts, categories } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { 
  Plus, 
  FileEdit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  CheckCircle2,
  Clock,
  LayoutGrid,
  List
} from "lucide-react";
import Link from "next/link";

export default async function BlogCMSPage() {
  const dbPosts = await db.query.posts.findMany({
    with: {
      category: true,
      author: true,
    },
    orderBy: [desc(posts.createdAt)],
  });

  const displayPosts = dbPosts.length > 0 ? dbPosts : [
    {
      id: "1",
      title: "5 Tax Planning Strategies for Small Business Owners in 2024",
      status: "published",
      createdAt: new Date("2024-06-15"),
      author: { name: "Jenn Simpson" },
      category: { name: "Small Business" },
      views: 1240
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-brand-black">Blog CMS</h1>
          <p className="text-brand-charcoal/60 text-sm">Manage your tax tips, insights, and news articles.</p>
        </div>
        <button className="bg-brand-purple text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-brand-purple/20">
          <Plus size={20} /> Create New Post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Posts" value={displayPosts.length.toString()} icon={<FileEdit className="text-brand-purple" />} />
        <StatCard title="Published" value={displayPosts.filter(p => p.status === 'published').length.toString()} icon={<CheckCircle2 className="text-green-500" />} />
        <StatCard title="Total Views" value="2.1k" icon={<Eye className="text-blue-500" />} />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search posts..." 
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-brand-charcoal/40">
              <th className="px-8 py-4">Title</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Category</th>
              <th className="px-8 py-4">Date</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayPosts.map((post: any) => (
              <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-8 py-6">
                  <span className="font-bold text-brand-black group-hover:text-brand-purple transition-colors block max-w-md truncate">
                    {post.title}
                  </span>
                  <span className="text-xs text-gray-400">{post.author?.name}</span>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    post.status === 'published' 
                      ? 'bg-green-50 text-green-600 border-green-200' 
                      : 'bg-orange-50 text-orange-600 border-orange-200'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-brand-charcoal/60">{post.category?.name}</td>
                <td className="px-8 py-6 text-sm text-brand-charcoal/40">{new Date(post.createdAt).toLocaleDateString()}</td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-brand-purple hover:bg-brand-purple/5 rounded-lg transition-all">
                      <FileEdit size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
