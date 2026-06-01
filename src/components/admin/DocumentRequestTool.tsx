"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { requestDocuments } from "@/actions/admin";

export function DocumentRequestTool({ clientId, returnId }: { clientId: string, returnId: string }) {
  const [documentList, setDocumentList] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function handleSend() {
    if (!documentList.trim()) return;
    
    setIsSending(true);
    setMessage(null);
    
    try {
      await requestDocuments(clientId, returnId, documentList);
      setDocumentList("");
      setMessage({ type: 'success', text: 'Request sent successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send request. Please try again.' });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-brand-orange/10 rounded-lg flex items-center justify-center">
          <Send className="text-brand-orange" size={18} />
        </div>
        <h3 className="font-bold text-brand-navy text-lg">Request Documents</h3>
      </div>
      
      <p className="text-xs text-brand-charcoal/60 font-medium leading-relaxed">
        Enter the documents you need from the client. They will receive an email and SMS with a link to upload them to their secure portal.
      </p>

      <textarea
        className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all min-h-[100px]"
        placeholder="e.g. 2023 W-2 from Acme Corp, 1099-INT from Bank of America..."
        value={documentList}
        onChange={(e) => setDocumentList(e.target.value)}
        disabled={isSending}
      />

      <button
        onClick={handleSend}
        disabled={isSending || !documentList.trim()}
        className="w-full bg-brand-navy text-white font-bold py-2.5 rounded-xl hover:bg-blue-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
      >
        {isSending ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Sending...
          </>
        ) : (
          <>
            <Send size={18} />
            Send Request
          </>
        )}
      </button>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-bold text-center animate-in fade-in slide-in-from-top-1 ${
          message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
