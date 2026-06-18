"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [showMfa, setShowMfa] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    code: "",
  });
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      code: formData.code,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "MFA_REQUIRED") {
        setShowMfa(true);
      } else {
        setError(result.error);
      }
    } else {
      if (isAdminLogin) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/portal";
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-brand-cloud">
      {/* Left side: Content */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/">
            <Image
              src="/images/logo-long.png"
              alt="Your Tax Source"
              width={200}
              height={50}
              className="h-10 w-auto mb-8"
            />
          </Link>
          
          <h2 className="font-serif text-3xl font-medium tracking-tight text-brand-black mb-2">
            {isAdminLogin ? "Admin & Staff Login" : "Welcome Back"}
          </h2>
          <p className="text-gray-600 mb-8">
            {isAdminLogin 
              ? "Access the staff dashboard to manage client returns." 
              : "Log in to your secure portal to manage your taxes."}
          </p>

          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => setIsAdminLogin(false)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${!isAdminLogin ? 'bg-brand-purple text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Client Login
            </button>
            <button 
              onClick={() => setIsAdminLogin(true)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isAdminLogin ? 'bg-brand-black text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Admin / Staff
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!showMfa ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-brand-black">Email Address</label>
                  <input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    type="email"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-brand-black shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple transition-all"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-brand-black">Password</label>
                    <Link href="/auth/forgot-password" size="sm" className="text-xs font-medium text-brand-purple hover:text-brand-purple/80 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    type="password"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-brand-black shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-brand-black">MFA Code</label>
                <input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  type="text"
                  required
                  placeholder="000000"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-brand-black shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple transition-all text-center tracking-widest"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the 6-digit code from your authenticator app.
                </p>
              </div>
            )}
            
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-brand-purple py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-purple/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple transition-all"
            >
              {showMfa ? "Verify & Sign In" : "Log In"}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="font-semibold text-brand-purple hover:text-brand-purple/80 transition-colors">
              Request access
            </Link>
          </p>
        </div>
      </div>

      {/* Right side: Image (Hidden on small screens) */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          src="/images/jenn-portrait-office.png"
          alt="Jenn Simpson"
          fill
          className="h-full w-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-brand-purple/10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <blockquote className="font-serif text-2xl leading-relaxed mb-4">
            "We provide plain-English tax advice and personalized service that you can trust."
          </blockquote>
          <p className="font-medium">— Jenn Simpson, Founder</p>
        </div>
      </div>
    </div>
  );
}
