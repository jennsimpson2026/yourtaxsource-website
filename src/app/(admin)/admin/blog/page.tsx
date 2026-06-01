"use client";

import { useState } from "react";
import { 
  Plus, 
  FileEdit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List
} from "lucide-react";

const INITIAL_POSTS = [
  {
    id: 1,
    title: "5 Tax Planning Strategies for Small Business Owners in 2024",
    status: "Published",
    date: "2024-06-15",
    author: "Jennifer Simpson",
    category: "Small Business",
    views: 1240
  },
  {
    id: 2,
    title: "Understanding the New Clean Vehicle Credit",
    status: "Published",
    date: "2024-06-10",
    author: "Jennifer Simpson",
    category: "Individual Tax",
    views: 856
  },
  {
    id: 3,
    title: "How to Keep Your Books Audit-Ready All Year Round",
    status: "Draft",
    date: "2024-06-05",
    author: "Jennifer Simpson",
    category: "Bookkeeping",
    views: 0
  }
];

export default function BlogCMSPage() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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
        <StatCard title="Total Posts" value={posts.length.toString()} icon={<FileEdit className="text-brand-purple" />} />
        <StatCard title="Published" value={posts.filter(p => p.status === 'Published').length.toString()} icon={<CheckCircle2 className="text-green-500" />} />
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
        <div className="flex gap-2">
          <button className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 hover:bg-gray-100 transition-all">
            <Filter size={18} />
          </button>
          <div className="bg-gray-50 p-1 rounded-xl border border-gray-100 flex">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-purple' : 'text-gray-400'}`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-purple' : 'text-gray-400'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
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
              <th className="px-8 py-4">Views</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-8 py-6">
                  <span className="font-bold text-brand-black group-hover:text-brand-purple transition-colors block max-w-md truncate">
                    {post.title}
                  </span>
                  <span className="text-xs text-gray-400">{post.author}</span>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    post.status === 'Published' 
                      ? 'bg-green-50 text-green-600 border-green-200' 
                      : 'bg-orange-50 text-orange-600 border-orange-200'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-brand-charcoal/60">{post.category}</td>
                <td className="px-8 py-6 text-sm text-brand-charcoal/40">{post.date}</td>
                <td className="px-8 py-6 text-sm font-bold text-brand-black">{post.views}</td>
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
