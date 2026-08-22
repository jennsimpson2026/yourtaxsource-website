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
  CheckCircle2,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function EditBlogPostForm({ post, categories }: { post: any, categories: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [formData, setFormData] = useState({
    title: post.title,
    slug: post.slug,
    content: post.content,
    categoryId: post.categoryId,
    status: post.status as "draft" | "published" | "scheduled",
    featuredImageUrl: post.featuredImageUrl || "",
    publishDate: post.publishDate ? new Date(post.publishDate).toISOString().split('T')[0] : "",
    seoTitle: post.seoTitle || "",
    seoDescription: post.seoDescription || "",
    socialDescription: post.socialDescription || "",
    socialHashtags: post.socialHashtags || "[]",
    researchSources: post.researchSources || "[]",
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
            onClick={() => window.open(`/blog/${formData.slug}?preview=true&id=${post.id}`, "_blank")}
            className="px-6 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <Eye size={18} /> Preview
          </button>
          
          {formData.status === 'draft' && (
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await updatePost(post.id, { ...formData, status: 'published' });
                    toast.success("Article published!");
                    router.push("/admin/blog");
                    router.refresh();
                  } catch (e) {
                    toast.error("Failed to publish");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-600/20"
              >
                <CheckCircle2 size={18} /> Approve & Publish
              </button>

              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="bg-brand-black text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center gap-2"
                >
                  <Calendar size={18} /> Approve & Schedule
                </button>
                
                {showSchedule && (
                  <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 w-64 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Publish Date</label>
                    <input 
                      type="date"
                      value={formData.publishDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                      className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg text-sm mb-4"
                    />
                    <button 
                      type="button"
                      disabled={loading || !formData.publishDate}
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await updatePost(post.id, { ...formData, status: 'scheduled' });
                          toast.success("Article scheduled!");
                          router.push("/admin/blog");
                          router.refresh();
                        } catch (e) {
                          toast.error("Failed to schedule");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="w-full bg-brand-purple text-white py-2 rounded-lg font-bold text-xs"
                    >
                      Confirm Schedule
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <button 
            form="post-form"
            type="submit"
            disabled={loading}
            className="bg-brand-purple text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-brand-purple/20 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {formData.status === 'published' ? 'Update Post' : 'Save Changes'}
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

          {/* AI Metadata Section */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
            <div>
              <h3 className="text-xl font-heading font-bold text-brand-black mb-1">SEO & Social Metadata</h3>
              <p className="text-xs text-brand-charcoal/40 font-medium uppercase tracking-widest mb-6">Generated by AI Assistant</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-brand-black mb-2 uppercase tracking-widest">SEO Title</label>
                  <input 
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm outline-none focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-black mb-2 uppercase tracking-widest">SEO Description</label>
                  <input 
                    type="text"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm outline-none focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-2 uppercase tracking-widest">Social Media Caption</label>
              <textarea 
                value={formData.socialDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, socialDescription: e.target.value }))}
                rows={3}
                className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 text-sm outline-none focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-2 uppercase tracking-widest">Hashtags</label>
              <input 
                type="text"
                value={formData.socialHashtags}
                onChange={(e) => setFormData(prev => ({ ...prev, socialHashtags: e.target.value }))}
                placeholder='["tax", "business"]'
                className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-black mb-2 uppercase tracking-widest">Research Sources</label>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs font-mono overflow-x-auto whitespace-pre">
                {formData.researchSources}
              </div>
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
