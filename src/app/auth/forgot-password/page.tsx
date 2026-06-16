"use client";

import { useState } from "react";
import { forgotPassword } from "@/actions/auth";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      const result = await forgotPassword(formData);
      
      if (result?.error) {
        setError(result.error);
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center space-y-6 p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="mx-auto w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <Mail size={32} />
          </div>
          <h2 className="text-3xl font-black text-brand-black">Check your email</h2>
          <p className="text-brand-charcoal/70">
            If an account exists for <span className="font-semibold">{email}</span>, we've sent instructions to reset your password.
          </p>
          <div className="pt-4">
            <Link 
              href="/auth/login"
              className="text-brand-purple font-bold hover:underline inline-flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-black text-brand-black">Forgot Password?</h2>
          <p className="mt-2 text-brand-charcoal/60">
            No worries! Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-brand-charcoal mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100 text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full flex justify-center py-4 px-4 border border-transparent text-lg font-black rounded-xl text-white bg-brand-purple hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-brand-purple/20"
            >
              {status === "loading" ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
            </button>
            
            <Link 
              href="/auth/login"
              className="w-full flex justify-center py-3 text-brand-charcoal/60 font-bold hover:text-brand-purple transition-colors items-center gap-2"
            >
              <ArrowLeft size={18} /> Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
