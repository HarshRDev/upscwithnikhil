"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim()
    );

    setLoading(false);

    if (resetError) {
      setError(
        resetError.message || "Unable to send reset email. Please try again."
      );
      return;
    }

    setMessage("Password reset email sent. Please check your inbox.");
  };

  return (
    <div className="min-h-screen bg-[#F5EBDD] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Forgot Password</h1>
        <p className="text-gray-600 mb-6">
          Enter your email and we will send you a password reset link.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white py-2 rounded-lg font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Remembered your password?{" "}
          <Link href="/auth/login" className="text-pink-500 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
