"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePost } from "@/actions/admin/blog";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Image as ImageIcon,
  Loader2,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

export function EditBlogPostForm({ post, categories }: { post: any, categories: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: post.title,
    slug: post.slug,
    content: post.content,
    categoryId: post.categoryId,
    status: post.status as "draft" | "published",
    featuredImageUrl: post.featuredImageUrl || "",
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updatePost(post.id, formData);
      router.push("/admin/blog");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/admin/blog" className="text-xs font-bold text-gray-400 hover:text-brand-purple flex items-center gap-1 mb-2 uppercase tracking-widest transition-colors">
            <ArrowLeft size={14} /> Back to Blog CMS
          </Link>
          <h1 className="text-3xl font-heading font-bold text-brand-black">Edit Post</h1>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => window.open(`/blog/${formData.slug}?preview=true`, "_blank")}
            className="px-6 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <Eye size={18} /> Preview
          </button>
          <button 
            form="post-form"
            type="submit"
            disabled={loading}
            className="bg-brand-purple text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-brand-purple/20 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Update Post
          </button>
        </div>
      </div>

      <form id="post-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-bold text-brand-black mb-2">Post Title</label>
              <input 
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. 5 Tax Tips for 2024"
                className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all text-lg font-heading font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-black mb-2">Slug (URL)</label>
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span>yourtaxsource.com/blog/</span>
                <input 
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="bg-transparent border-none outline-none text-brand-purple font-bold flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-black mb-2">Content (Markdown supported)</label>
              <textarea 
                required
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={15}
                placeholder="Write your post content here..."
                className="w-full p-6 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all font-mono text-sm leading-relaxed"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-brand-black border-b border-gray-50 pb-4">Post Settings</h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none"
              >
                <option value="draft">Draft (Admin Only)</option>
                <option value="published">Published (Public)</option>
              </select>
              <p className="text-[10px] text-gray-400 mt-2">Change status to "Published" to show on the live /blog page.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
              <select 
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Featured Image URL</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={formData.featuredImageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, featuredImageUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs outline-none"
                  />
                  <button type="button" className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-brand-purple transition-all">
                    <ImageIcon size={18} />
                  </button>
                </div>
                {formData.featuredImageUrl && (
                  <div className="aspect-video rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                    <img src={formData.featuredImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
