"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { submitContactForm } from "@/actions/contact";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    const result = await submitContactForm(formData);
    
    if (result.success) {
      setStatus("success");
      setMessage("Thank you! Your message has been sent.");
    } else {
      setStatus("error");
      setMessage(result.error || "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 p-8 rounded-xl border border-green-200 text-center">
        <h3 className="text-2xl font-bold text-green-900 mb-2">Message Sent!</h3>
        <p className="text-green-700">{message}</p>
        <button 
          onClick={() => setStatus("idle")}
          className="mt-6 text-green-900 font-bold hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-bold text-brand-navy mb-2 uppercase tracking-wide">First Name</label>
          <input 
            id="firstName"
            name="firstName"
            type="text" 
            required
            className="w-full px-4 py-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all" 
            placeholder="Jane" 
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-bold text-brand-navy mb-2 uppercase tracking-wide">Last Name</label>
          <input 
            id="lastName"
            name="lastName"
            type="text" 
            required
            className="w-full px-4 py-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all" 
            placeholder="Doe" 
          />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-bold text-brand-navy mb-2 uppercase tracking-wide">Email Address</label>
        <input 
          id="email"
          name="email"
          type="email" 
          required
          className="w-full px-4 py-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all" 
          placeholder="jane@example.com" 
        />
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-bold text-brand-navy mb-2 uppercase tracking-wide">Subject</label>
        <select 
          id="subject"
          name="subject"
          className="w-full px-4 py-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all appearance-none bg-white"
        >
          <option value="General Inquiry">General Inquiry</option>
          <option value="Individual Tax Question">Individual Tax Question</option>
          <option value="Business Tax Question">Business Tax Question</option>
          <option value="Advisory Services">Advisory Services</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-bold text-brand-navy mb-2 uppercase tracking-wide">Message</label>
        <textarea 
          id="message"
          name="message"
          rows={4} 
          required
          className="w-full px-4 py-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all" 
          placeholder="How can we help you?"
        ></textarea>
      </div>
      
      {status === "error" && (
        <p className="text-red-600 text-sm font-medium">{message}</p>
      )}

      <button 
        type="submit" 
        disabled={status === "loading"}
        className="w-full bg-brand-navy text-white py-4 rounded-md font-bold text-lg hover:bg-blue-900 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {status === "loading" ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
        {status === "loading" ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
