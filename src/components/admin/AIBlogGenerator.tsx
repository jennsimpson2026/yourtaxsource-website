"use client";

import { useState } from "react";
import { Sparkles, Loader2, X, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const AIBlogGenerator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      toast.success("Blog draft generated successfully!");
      router.push(`/admin/blog/edit/${data.postId}`);
      setIsOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(`Generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-brand-black text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-black/10 border border-white/10"
      >
        <Sparkles size={20} className="text-brand-purple" /> AI Assistant
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center text-brand-purple">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-heading font-bold text-brand-black">AI Blog Assistant</h3>
                  <p className="text-xs text-brand-charcoal/40 font-bold uppercase tracking-widest">Research & Draft</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-brand-charcoal/30 hover:text-brand-black transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-charcoal/40 mb-4">
                  What should the article be about?
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Important 2024 tax deadlines for small business owners in North Carolina..."
                  className="w-full h-32 bg-brand-soft-gray border-none rounded-3xl p-6 text-brand-black font-bold placeholder:text-brand-charcoal/20 focus:ring-2 focus:ring-brand-purple/20 transition-all resize-none"
                  disabled={isGenerating}
                />
              </div>

              <div className="p-4 bg-brand-lavender/10 rounded-2xl border border-brand-purple/10 flex gap-3">
                <div className="text-brand-purple pt-1">
                  <Send size={16} />
                </div>
                <p className="text-xs text-brand-charcoal/60 font-medium leading-relaxed">
                  The assistant will research primary sources (IRS.gov) and draft a complete article in your brand voice with SEO metadata and social captions.
                </p>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex justify-end gap-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 font-bold text-brand-charcoal/60 hover:text-brand-black transition-colors"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="bg-brand-purple text-white px-8 py-4 rounded-2xl font-bold hover:bg-opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-brand-purple/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Researching...
                  </>
                ) : (
                  <>
                    Generate Draft
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
