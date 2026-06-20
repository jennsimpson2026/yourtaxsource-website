"use client";

import { useState } from "react";
import { 
  FileEdit, 
  Trash2, 
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus
} from "lucide-react";
import Link from "next/link";
import { deletePost } from "@/actions/admin/blog";
import { useRouter } from "next/navigation";

interface BlogCMSTableProps {
  initialPosts: any[];
}

export function BlogCMSTable({ initialPosts }: BlogCMSTableProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setIsDeleting(id);
    try {
      await deletePost(id);
      setPosts(posts.filter(p => p.id !== id));
      router.refresh();
    } catch (error) {
      console.error("Failed to delete post:", error);
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
          {posts.map((post: any) => (
            <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-8 py-6">
                <Link href={`/blog/${post.slug}`} target="_blank" className="font-bold text-brand-black group-hover:text-brand-purple transition-colors block max-w-md truncate flex items-center gap-2">
                  {post.title} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
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
                  <Link 
                    href={`/admin/blog/edit/${post.id}`}
                    className="p-2 text-gray-400 hover:text-brand-purple hover:bg-brand-purple/5 rounded-lg transition-all"
                  >
                    <FileEdit size={18} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    disabled={isDeleting === post.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {posts.length === 0 && (
            <tr>
              <td colSpan={5} className="px-8 py-20 text-center text-gray-400">
                No posts found. Create your first post!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
