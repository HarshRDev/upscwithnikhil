"use client";

import Link from "next/link";

export default function NotAuthorizedPage() {
  return (
    <main className="min-h-screen bg-[#F5EBDD] flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-white border border-gray-200 rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-3">
          Not authorized
        </h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to access this page. Please sign in with an
          admin account or contact support.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-pink-500 text-white px-5 py-2 rounded-lg font-medium hover:opacity-90 transition"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/auth/login?next=/admin"
            className="bg-white text-pink-600 border border-pink-300 px-5 py-2 rounded-lg font-medium hover:bg-pink-50 transition"
          >
            Sign in as Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
