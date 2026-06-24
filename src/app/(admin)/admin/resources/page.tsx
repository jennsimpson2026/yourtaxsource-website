"use client";

import { useState, useEffect } from "react";
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
  List,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { getPosts, deletePost } from "@/actions/resources";
import Link from "next/link";
import { toast } from "sonner";

export default function ResourcesCMSPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    
    try {
      const result = await deletePost(id);
      if (result.success) {
        toast.success("Resource deleted");
        fetchPosts();
      } else {
        toast.error(result.error || "Failed to delete resource");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-brand-black">Resources CMS</h1>
          <p className="text-brand-charcoal/60 text-sm">Manage your tax guides, checklists, and official links.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/resources/new" 
            className="bg-brand-purple text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-brand-purple/20"
          >
            <Plus size={20} /> Create New
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Resources" value={posts.length.toString()} icon={<FileEdit className="text-brand-purple" />} />
        <StatCard title="Published" value={posts.filter(p => p.status === 'published').length.toString()} icon={<CheckCircle2 className="text-green-500" />} />
        <StatCard title="Drafts" value={posts.filter(p => p.status === 'draft').length.toString()} icon={<Clock className="text-blue-500" />} />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row justify-between gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by title or category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
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

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading resources...</p>
        </div>
      ) : filteredPosts.length > 0 ? (
        viewMode === 'list' ? (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-brand-navy">{post.title}</span>
                        <span className="text-xs text-gray-400 font-medium truncate max-w-xs">{post.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-cloud text-brand-navy border border-brand-navy/10">
                        {post.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {post.status === 'published' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                      {post.publishDate ? new Date(post.publishDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/resources/${post.slug}`} target="_blank" className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-brand-purple transition-all border border-transparent hover:border-gray-100">
                          <Eye size={18} />
                        </Link>
                        <Link href={`/admin/resources/edit/${post.id}`} className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-brand-purple transition-all border border-transparent hover:border-gray-100">
                          <FileEdit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-gray-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all group flex flex-col h-full shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold px-2 py-1 bg-brand-cloud text-brand-navy rounded-full uppercase tracking-wider">
                    {post.category.name}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/resources/edit/${post.id}`} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-brand-purple">
                      <FileEdit size={16} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-brand-navy mb-2 flex-1 group-hover:text-brand-purple transition-colors">
                  {post.title}
                </h3>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    post.status === 'published' ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {post.status}
                  </span>
                  <Link href={`/resources/${post.slug}`} target="_blank" className="text-brand-purple font-bold text-xs flex items-center gap-1">
                    Preview <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center shadow-sm">
          <FileEdit className="mx-auto text-gray-200 mb-4" size={48} />
          <h3 className="text-lg font-bold text-brand-navy mb-2">No resources found</h3>
          <p className="text-gray-400 mb-8">Try adjusting your search or create a new resource.</p>
          <Link href="/admin/resources/new" className="bg-brand-purple text-white px-8 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all inline-flex items-center gap-2">
            <Plus size={20} /> Create Your First Resource
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-black text-brand-navy">{value}</h3>
        </div>
      </div>
    </div>
  );
}
