"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/users";
import { useRouter } from "next/navigation";
import { User, Image as ImageIcon, Save, Loader2, CheckCircle2 } from "lucide-react";

interface ProfileFormProps {
  initialData: {
    name: string;
    image: string;
  };
}

export const ProfileForm = ({ initialData }: ProfileFormProps) => {
  const [formData, setFormData] = useState(initialData);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setSuccess(false);

    try {
      await updateProfile(formData);
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-[0.2em] text-brand-charcoal/40 mb-3">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/30">
              <User size={18} />
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your full name"
              className="w-full bg-brand-soft-gray border-none rounded-2xl py-4 pl-12 pr-6 text-brand-black font-bold focus:ring-2 focus:ring-brand-purple/20 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-[0.2em] text-brand-charcoal/40 mb-3">
            Profile Photo URL
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/30">
              <ImageIcon size={18} />
            </div>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="https://example.com/photo.jpg"
              className="w-full bg-brand-soft-gray border-none rounded-2xl py-4 pl-12 pr-6 text-brand-black font-bold focus:ring-2 focus:ring-brand-purple/20 transition-all"
            />
          </div>
          <p className="mt-2 text-[10px] text-brand-charcoal/40 font-medium italic">
            Enter a direct link to your profile photo (e.g., from Unsplash, LinkedIn, or S3).
          </p>
        </div>

        {formData.image && (
          <div className="pt-4 border-t border-gray-50">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-charcoal/40 mb-4">Preview</p>
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-brand-purple/20 bg-gray-50">
              <img 
                src={formData.image} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formData.name || 'User');
                }}
              />
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-brand-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-black/10"
          >
            {isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isPending ? "Saving Changes..." : "Save Profile"}
          </button>

          {success && (
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 size={18} />
              Profile updated!
            </div>
          )}
        </div>
      </div>
    </form>
  );
};
