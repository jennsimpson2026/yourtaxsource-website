"use client";

import { useState, useRef } from "react";
import { getUploadUrl, registerDocument } from "@/actions/documents";
import { ShieldCheck, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function DocumentUpload({ returnId }: { returnId?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("SUPPORTING");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Get pre-signed URL
      console.log("Requesting upload URL for:", file.name, category);
      const { uploadUrl, s3Key, taxYear } = await getUploadUrl(
        file.name,
        file.type,
        category,
        returnId
      );
      console.log("Got upload URL, starting fetch...");

      // 2. Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      console.log("Upload response status:", uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("S3 Upload Error:", errorText);
        throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
      }

      // 3. Register in database
      await registerDocument({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        s3Key: s3Key,
        category,
        taxYear,
        returnId,
      });

      setSuccess(true);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Refresh the page or the document list
      router.refresh();
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-brand-lavender rounded-2xl flex items-center justify-center text-brand-purple">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="text-xl font-heading font-bold text-brand-black">Secure Document Upload</h3>
          <p className="text-brand-charcoal/60 text-sm">Direct, encrypted upload to your secure folder.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-brand-black mb-2">Document Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={uploading}
            className="w-full p-3 rounded-xl border border-gray-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition-all bg-white"
          >
            <option value="SUPPORTING">Supporting Documents (W2s, 1099s, etc.)</option>
            <option value="INTAKE">Intake Questionnaire / Organizer</option>
            <option value="BUSINESS">Business Records</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div 
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`p-10 border-2 border-dashed rounded-[2rem] text-center cursor-pointer transition-all ${
            file ? 'border-brand-purple bg-brand-lavender/30' : 'border-gray-200 hover:border-brand-purple/50 bg-gray-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <div className="flex flex-col items-center">
            {file ? (
              <>
                <CheckCircle2 className="text-brand-purple mb-3" size={48} />
                <p className="text-brand-black font-bold">{file.name}</p>
                <p className="text-brand-charcoal/60 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <Upload className="text-gray-400 mb-3" size={48} />
                <p className="text-brand-black font-bold">Click to select or drag and drop</p>
                <p className="text-brand-charcoal/60 text-xs">PDF, JPEG, or PNG preferred</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm border border-red-100">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 text-sm border border-green-100 font-bold">
            <CheckCircle2 size={20} />
            <p>Document uploaded successfully!</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            !file || uploading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-brand-purple text-white shadow-lg shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Uploading...
            </>
          ) : (
            "Complete Upload"
          )}
        </button>
      </div>
    </div>
  );
}
