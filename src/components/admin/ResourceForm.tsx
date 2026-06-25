"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, 
  X, 
  Upload, 
  FileText, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { getResourceUploadUrl, createResource, updateResource } from "@/actions/resources";

interface Category {
  id: string;
  name: string;
}

interface ResourceFormProps {
  initialData?: any;
  categories: Category[];
}

export function ResourceForm({ initialData, categories }: ResourceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const isEdit = !!initialData;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;
    const status = formData.get("status") as string;
    const content = formData.get("content") as string;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    try {
      let fileUrl = initialData?.fileUrl;

      // 1. Upload file if selected
      if (file) {
        setUploadProgress(10);
        const { uploadUrl, s3Key } = await getResourceUploadUrl(file.name, file.type);
        setUploadProgress(30);

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) throw new Error("Failed to upload file to S3");
        
        setUploadProgress(70);
        // Construct the public URL
        const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "your-tax-source-docs";
        const region = "us-east-2"; // Standard for this project
        fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
      }

      // 2. Save to database
      const data = {
        title,
        slug,
        content,
        categoryId,
        status,
        fileUrl,
      };

      if (isEdit) {
        await updateResource(initialData.id, data);
      } else {
        await createResource(data);
      }

      setUploadProgress(100);
      router.push("/admin/resources");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while saving the resource.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-brand-black mb-2 uppercase tracking-widest">Resource Title</label>
              <input 
                id="title"
                name="title"
                type="text" 
                required
                defaultValue={initialData?.title}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium"
                placeholder="e.g. 2024 Tax Checklist"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-bold text-brand-black mb-2 uppercase tracking-widest">Description / Content</label>
              <textarea 
                id="content"
                name="content"
                rows={6}
                required
                defaultValue={initialData?.content}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium"
                placeholder="Describe this resource..."
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <label className="block text-sm font-bold text-brand-black mb-4 uppercase tracking-widest">Resource File</label>
            
            <div className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center ${file ? 'border-brand-purple bg-brand-purple/5' : 'border-gray-200 hover:border-brand-purple/50'}`}>
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.xlsx,.xls,.docx,.doc"
              />
              
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
                {file ? <FileText className="text-brand-purple" size={32} /> : <Upload size={32} />}
              </div>
              
              {file ? (
                <div>
                  <p className="font-bold text-brand-black">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  <button 
                    type="button" 
                    onClick={() => setFile(null)}
                    className="mt-4 text-xs font-bold text-red-500 hover:underline"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-brand-black">Click or drag to upload</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, Excel, or Word (Max 10MB)</p>
                </div>
              )}
            </div>

            {initialData?.fileUrl && !file && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <FileText size={16} className="text-gray-400" />
                <span className="text-xs font-medium text-brand-charcoal/60 truncate flex-1">{initialData.fileUrl}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Current</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label htmlFor="categoryId" className="block text-sm font-bold text-brand-black mb-2 uppercase tracking-widest">Category</label>
              <select 
                id="categoryId"
                name="categoryId"
                required
                defaultValue={initialData?.categoryId}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-bold text-brand-black mb-2 uppercase tracking-widest">Status</label>
              <select 
                id="status"
                name="status"
                required
                defaultValue={initialData?.status || "draft"}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium appearance-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-purple/20 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {uploadProgress > 0 && uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : "Saving..."}
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isEdit ? "Update Resource" : "Create Resource"}
                </>
              )}
            </button>
            
            <Link 
              href="/admin/resources"
              className="w-full bg-white border border-gray-100 py-4 rounded-2xl font-bold text-brand-charcoal hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <X size={20} />
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
