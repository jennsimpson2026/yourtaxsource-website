"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/actions/auth";
import Link from "next/link";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("token", token);
      formData.append("password", password);

      const result = await resetPassword(formData);
      if (result?.error) {
        setError(result.error);
        setStatus("error");
      } else {
        setStatus("success");
        setTimeout(() => {
          router.push("/auth/login?message=Password reset successful. Please log in.");
        }, 2000);
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
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black text-brand-black">Password Reset!</h2>
          <p className="text-brand-charcoal/70">
            Your password has been successfully updated. Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-black text-brand-black">Reset Password</h2>
          <p className="mt-2 text-brand-charcoal/60">
            Enter a new password for <span className="font-semibold text-brand-black">{email}</span>
          </p>
        </div>

        {!email || !token ? (
          <div className="p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm">
              This password reset link appears to be invalid or incomplete. Please request a new one from the forgot password page.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-charcoal mb-2">New Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-charcoal mb-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100 text-center font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full flex justify-center py-4 px-4 border border-transparent text-lg font-black rounded-xl text-white bg-brand-purple hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-brand-purple/20"
            >
              {status === "loading" ? <Loader2 className="animate-spin" /> : "Reset Password"}
            </button>
          </form>
        )}
        
        <div className="text-center">
          <Link href="/auth/login" className="text-sm font-bold text-brand-charcoal/60 hover:text-brand-purple transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin text-brand-purple"><Loader2 size={32} /></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
