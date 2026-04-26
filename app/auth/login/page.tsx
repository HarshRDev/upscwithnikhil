"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email.trim(),
      password: formData.password,
    });

    setLoading(false);

    if (signInError) {
      setError(
        signInError.message ||
          "Unable to sign in. Please check your email and password."
      );
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      await fetch("/api/auth/sync-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      });
    }

    setMessage("Signed in successfully. Redirecting…");
    const next = searchParams.get("next");
    const dest =
      next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : "/dashboard";
    setTimeout(() => {
      router.push(dest);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F5EBDD] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.back()}
          className="text-[#0F172A] hover:underline mb-8 text-sm"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Welcome Back</h1>
          <p className="text-gray-600 mb-8">
            Sign in to your UPSC platform account
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 text-white py-2 rounded-lg font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Do not have an account?
              </span>
            </div>
          </div>

          <Link
            href="/auth/signup"
            className="w-full block text-center bg-white border border-pink-500 text-pink-500 py-2 rounded-lg font-medium hover:bg-pink-50 transition-all duration-200"
          >
            Create Account
          </Link>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          <Link href="/auth/forgot-password" className="text-pink-500 hover:underline">
            Forgot password?
          </Link>{" "}
          Reset it in a few clicks.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5EBDD] flex items-center justify-center text-[#0F172A]">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
