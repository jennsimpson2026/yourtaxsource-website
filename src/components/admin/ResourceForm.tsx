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
  AlertCircle,
  Plus,
  Trash2,
  FileSpreadsheet,
  File
} from "lucide-react";
import Link from "next/link";
import { getResourceUploadUrl, createResource, updateResource } from "@/actions/resources";

interface Attachment {
  id?: string;
  file?: File | null;
  fileUrl?: string;
  fileName: string;
  label: string;
  fileType: string;
}

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
  
  const [attachments, setAttachments] = useState<Attachment[]>(
    initialData?.attachments?.map((att: any) => ({
      id: att.id,
      fileUrl: att.fileUrl,
      fileName: att.fileName,
      label: att.label,
      fileType: att.fileType,
    })) || []
  );

  const isEdit = !!initialData;

  const addAttachment = () => {
    setAttachments([
      ...attachments,
      {
        fileName: "",
        label: "",
        fileType: "",
        file: null,
      }
    ]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const updateAttachment = (index: number, updates: Partial<Attachment>) => {
    const newAttachments = [...attachments];
    newAttachments[index] = { ...newAttachments[index], ...updates };
    setAttachments(newAttachments);
  };

  const handleFileChange = (index: number, file: File | null) => {
    if (!file) return;
    
    const ext = file.name.split('.').pop()?.toUpperCase() || "FILE";
    updateAttachment(index, {
      file,
      fileName: file.name,
      fileType: ext,
      // Only set label if it's empty
      label: attachments[index].label || file.name.split('.')[0],
    });
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;
    const status = formData.get("status") as string;
    const content = formData.get("content") as string;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    try {
      if (attachments.length === 0) {
        throw new Error("Please add at least one file attachment.");
      }

      // Check if all attachments have files (either existing or new) and labels
      attachments.forEach((att, i) => {
        if (!att.fileUrl && !att.file) {
          throw new Error(`Attachment #${i + 1} is missing a file.`);
        }
        if (!att.label.trim()) {
          throw new Error(`Attachment #${i + 1} is missing a label.`);
        }
      });

      const processedAttachments = [];
      const totalSteps = attachments.length * 2; // Upload + Save metadata
      let currentStep = 0;

      for (let i = 0; i < attachments.length; i++) {
        const att = attachments[i];
        let fileUrl = att.fileUrl;

        if (att.file) {
          const { uploadUrl, fileUrl: serverFileUrl } = await getResourceUploadUrl(att.file.name, att.file.type);
          
          const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            body: att.file,
            headers: {
              "Content-Type": att.file.type,
            },
          });

          if (!uploadResponse.ok) throw new Error(`Failed to upload file: ${att.file.name}`);
          fileUrl = serverFileUrl;
        }

        processedAttachments.push({
          id: att.id,
          fileUrl,
          fileName: att.fileName,
          label: att.label,
          fileType: att.fileType,
          sortOrder: i,
        });

        currentStep += 2;
        setUploadProgress(Math.round((currentStep / totalSteps) * 100));
      }

      // 2. Save to database
      const data = {
        title,
        slug,
        content,
        categoryId,
        status,
        attachments: processedAttachments,
        // Legacy support
        fileUrl: processedAttachments[0]?.fileUrl || null,
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

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-brand-black uppercase tracking-widest">Resource Files</label>
              <button 
                type="button" 
                onClick={addAttachment}
                className="flex items-center gap-2 text-xs font-bold text-brand-purple hover:bg-brand-purple/5 px-3 py-2 rounded-xl transition-all"
              >
                <Plus size={16} />
                Add Attachment
              </button>
            </div>
            
            <div className="space-y-4">
              {attachments.map((att, index) => (
                <div key={index} className="p-6 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-4 relative">
                  <div className="absolute top-4 left-6">
                    <span className="text-[10px] font-black text-brand-purple bg-brand-purple/10 px-2 py-1 rounded-md uppercase tracking-widest">
                      Attachment #{index + 1}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4 pt-6">
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Display Label (e.g. Printable PDF)</label>
                        <input 
                          type="text"
                          value={att.label}
                          onChange={(e) => updateAttachment(index, { label: e.target.value })}
                          className="w-full bg-white border border-gray-100 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium"
                          placeholder="How this file appears to clients"
                        />
                      </div>

                      <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all flex items-center gap-4 ${att.file || att.fileUrl ? 'border-brand-purple/30 bg-white' : 'border-gray-200 bg-white hover:border-brand-purple/50'}`}>
                        <input 
                          type="file" 
                          onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept=".pdf,.xlsx,.xls,.docx,.doc"
                        />
                        
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                          {att.fileType === 'PDF' ? <FileText className="text-red-500" size={20} /> : 
                           ['XLSX', 'XLS'].includes(att.fileType) ? <FileSpreadsheet className="text-green-600" size={20} /> :
                           <File className="text-brand-purple" size={20} />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {att.fileName ? (
                            <>
                              <p className="text-xs font-bold text-brand-black truncate">{att.fileName}</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest">{att.fileType} {att.file ? '(New)' : '(Existing)'}</p>
                            </>
                          ) : (
                            <p className="text-xs font-bold text-gray-400">Click to upload file</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove Attachment"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {attachments.length > 0 && (
                <button 
                  type="button" 
                  onClick={addAttachment}
                  className="w-full py-6 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-brand-purple hover:border-brand-purple/30 hover:bg-brand-purple/5 transition-all"
                >
                  <Plus size={24} />
                  <span className="text-sm font-bold uppercase tracking-widest">Add Another File</span>
                </button>
              )}

              {attachments.length === 0 && (
                <div className="py-12 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-400">
                  <Upload size={32} className="mb-2 opacity-20" />
                  <p className="text-sm font-medium">No attachments yet</p>
                  <button 
                    type="button" 
                    onClick={addAttachment}
                    className="mt-4 text-xs font-bold text-brand-purple hover:underline"
                  >
                    Click to add your first file
                  </button>
                </div>
              )}
            </div>
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
