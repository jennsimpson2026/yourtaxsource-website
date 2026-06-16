"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [showMfa, setShowMfa] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    code: "",
  });
  const router = useRouter();

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
      router.push("/portal");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-lg shadow">
        <h2 className="text-center text-3xl font-bold">Log in to your account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!showMfa ? (
            <>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Password</label>
                <input
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  type="password"
                  required
                  className="mt-1 block w-full rounded-md border p-2"
                />
              </div>
              <div className="flex items-center justify-end">
                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium">MFA Code</label>
              <input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                type="text"
                required
                placeholder="000000"
                className="mt-1 block w-full rounded-md border p-2"
              />
              <p className="mt-2 text-xs text-gray-500">
                Enter the code from your authenticator app.
              </p>
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
          >
            {showMfa ? "Verify" : "Log In"}
          </button>
        </form>
        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-blue-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
