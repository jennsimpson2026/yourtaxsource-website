"use client";

import { useState } from "react";
import { 
  Plus, 
  FileEdit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { deletePost } from "@/actions/admin/blog";
import { useRouter } from "next/navigation";

export function BlogCMSTable({ posts, categories }: { posts: any[], categories: any[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setIsDeleting(id);
    try {
      await deletePost(id);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete post");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
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
          {posts.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-8 py-12 text-center text-gray-400 italic">
                No posts found. Create your first post to get started!
              </td>
            </tr>
          ) : (
            posts.map((post: any) => (
              <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-8 py-6">
                  <span className="font-bold text-brand-black group-hover:text-brand-purple transition-colors block max-w-md truncate">
                    {post.title}
                  </span>
                  <span className="text-xs text-gray-400">{post.author?.name || 'Jenn Simpson'}</span>
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
                <td className="px-8 py-6 text-sm font-medium text-brand-charcoal/60">{post.category?.name || 'Uncategorized'}</td>
                <td className="px-8 py-6 text-sm text-brand-charcoal/40">
                  {post.publishDate ? new Date(post.publishDate).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <Link 
                      href={`/blog/${post.slug}`} 
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      title="View Live"
                    >
                      <Eye size={18} />
                    </Link>
                    <button 
                      className="p-2 text-gray-400 hover:text-brand-purple hover:bg-brand-purple/5 rounded-lg transition-all"
                      title="Edit (Coming Soon)"
                      onClick={() => alert("Post editing will be available in the next update. For now, please create a new post.")}
                    >
                      <FileEdit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      disabled={isDeleting === post.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      {isDeleting === post.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
