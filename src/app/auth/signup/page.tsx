"use client";

import { useState } from "react";
import { signUp } from "@/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-lg shadow">
        <h2 className="text-center text-3xl font-bold">Create an account</h2>
        <form action={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              name="name"
              type="text"
              required
              className="mt-1 block w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border p-2"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
