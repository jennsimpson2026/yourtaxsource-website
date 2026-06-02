"use client";

import { useState } from "react";
import { getUploadUrl, registerDocument } from "@/actions/documents";
import { ShieldAlert } from "lucide-react";

export function DocumentUpload({ returnId }: { returnId?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("SUPPORTING");

  // Phase 1 check: Only allow upload if S3 is configured
  // Note: Since this is a client component, we rely on the server action failure 
  // or a prop passed down. For now, we'll let the user see a disabled state if 
  // the server-side environment is incomplete.
  
  const isPhase1 = !process.env.NEXT_PUBLIC_S3_ENABLED; // Example flag or check

  if (uploading === false && !returnId && typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
     // Optional: more logic to disable in prod if keys are missing
  }

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-brand-lavender rounded-2xl flex items-center justify-center text-brand-purple">
          <ShieldAlert size={24} />
        </div>
        <h3 className="text-xl font-heading font-bold text-brand-black">Secure Document Upload</h3>
      </div>

      <p className="text-brand-charcoal/60 text-sm leading-relaxed">
        We are currently finalizing our secure storage integration. Document uploads will be enabled shortly in Phase 2.
      </p>

      <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
        <p className="text-gray-400 font-bold text-sm italic">Feature Coming Soon</p>
      </div>

      <button
        disabled={true}
        className="w-full bg-brand-purple/20 text-brand-purple/50 py-4 rounded-2xl font-bold text-lg cursor-not-allowed"
      >
        Upload Disabled
      </button>
    </div>
  );
}
