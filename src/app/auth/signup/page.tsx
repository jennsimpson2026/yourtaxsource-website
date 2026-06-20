"use client";

import { useState } from "react";
import { signUp } from "@/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await signUp(formData);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/auth/login");
    }
  }

  return (
    <div className="flex min-h-screen bg-brand-cloud">
      {/* Left side: Image (Hidden on small screens) */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          src="/images/jenn-meeting-clients.png"
          alt="Client Meeting"
          fill
          className="h-full w-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-brand-purple/10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <blockquote className="font-serif text-2xl leading-relaxed mb-4">
            "Your tax journey starts here. Secure, simple, and professional."
          </blockquote>
          <p className="font-medium">— Your Tax Source Team</p>
        </div>
      </div>

      {/* Right side: Content */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-24">
        <div className="mx-auto w-full max-sm:max-w-md w-full max-w-sm">
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
            Create an account
          </h2>
          <p className="text-gray-600 mb-8">
            Join our secure portal to get started with your tax preparation.
          </p>

          <form action={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-black">Full Name</label>
              <input
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-brand-black shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-black">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-brand-black shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple transition-all"
                placeholder="john@example.com"
              />
              <p className="mt-1 text-[10px] text-gray-500 italic">
                If you do not have an email address, enter <a href="mailto:none@yts.com" className="text-brand-purple underline">none@yts.com</a>.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-black">Phone Number</label>
              <input
                name="phone"
                type="tel"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-brand-black shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple transition-all"
                placeholder="(555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-black">Password</label>
              <input
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-brand-black shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple transition-all"
                placeholder="••••••••"
              />
            </div>
            
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-brand-purple py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-purple/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple transition-all"
            >
              Create Account
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-brand-purple hover:text-brand-purple/80 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
