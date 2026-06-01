"use client";

import { useState } from "react";
import { getUploadUrl, registerDocument } from "@/actions/documents";

export function DocumentUpload({ returnId }: { returnId?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("SUPPORTING");

  async function handleUpload() {
    if (!file) return;
    setUploading(true);

    try {
      const { uploadUrl, s3Key } = await getUploadUrl(file.name, file.type, category, returnId);

      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) throw new Error("Upload failed");

      await registerDocument({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        s3Key,
        category,
        returnId,
      });

      setFile(null);
      alert("File uploaded successfully");
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "Unknown error";
      alert(`Error uploading file: ${errorMessage}. Please ensure you are connected to the internet and try again. If the issue persists, contact support.`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border space-y-4">
      <h3 className="text-lg font-bold text-blue-900">Upload Tax Documents</h3>
      <div>
        <label className="block text-sm font-medium">Category</label>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border p-2"
        >
          <option value="SUPPORTING">Supporting Document (W2, 1099, etc)</option>
          <option value="INTAKE">Intake Form</option>
          <option value="ID_VERIFICATION">ID Verification</option>
        </select>
      </div>
      <div>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {uploading ? "Uploading..." : "Upload Document"}
      </button>
    </div>
  );
}
