"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { updateResource, getResource, getCategories } from "@/actions/admin/resources";
import {
  ArrowLeft,
  Save,
  Eye,
  Image as ImageIcon,
  Loader2,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditResourcePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    categoryId: "",
    status: "draft" as "draft" | "published",
    featuredImageUrl: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, resource] = await Promise.all([
          getCategories(),
          getResource(id)
        ]);
        
        setCategories(cats);
        if (resource) {
          setFormData({
            title: resource.title,
            slug: resource.slug,
            content: resource.content,
            categoryId: resource.categoryId,
            status: resource.status as any,
            featuredImageUrl: resource.featuredImageUrl || "",
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load resource data");
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateResource(id, formData);
      toast.success("Resource updated successfully");
      router.push("/admin/resources");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update resource");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-brand-purple" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/admin/resources" className="text-xs font-bold text-gray-400 hover:text-brand-purple flex items-center gap-1 mb-2 uppercase tracking-widest transition-colors">
            <ArrowLeft size={14} /> Back to Resources CMS
          </Link>
          <h1 className="text-3xl font-heading font-bold text-brand-black">Edit Resource</h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.open(`/resources/${formData.slug}?preview=true`, "_blank")}
            className="px-6 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <Eye size={18} /> Preview
          </button>
          <button
            form="resource-form"
            type="submit"
            disabled={loading}
            className="bg-brand-purple text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-brand-purple/20 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>

      <form id="resource-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-bold text-brand-black mb-2">Resource Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all text-lg font-heading"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-black mb-2">URL Slug</label>
              <div className="flex items-center gap-2 p-4 rounded-xl border border-gray-100 bg-gray-50">
                <span className="text-gray-400 text-sm">yourtaxsource.com/resources/</span>
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
                className="w-full p-6 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all font-mono text-sm leading-relaxed"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-brand-black border-b border-gray-50 pb-4">Resource Settings</h3>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
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
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Icon/Image URL (Optional)</label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.featuredImageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, featuredImageUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs outline-none"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-brand-navy p-6 rounded-3xl shadow-sm text-white space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-brand-purple">
              <CheckCircle2 size={18} />
              Resource Guide
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Updating this resource will reflect immediately on the public resources page and client dashboard.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
