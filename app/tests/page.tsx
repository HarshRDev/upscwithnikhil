"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

interface TestSeriesRow {
  id: string;
  title: string;
  description: string;
  price: number;
  total_tests?: number;
}

export default function TestsListingPage() {
  const [tests, setTests] = useState<TestSeriesRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/mcq-papers");
        const data = await res.json();
        if (Array.isArray(data)) {
          setTests(data);
        } else if (data?.error) {
          console.error(data.error);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5EBDD]">
        <Navbar />
        <p className="text-center text-gray-600 pt-24">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5EBDD]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
          MCQ papers
        </h1>
        <p className="text-gray-600 mb-8">
          Choose a paper to start. You will be asked to sign in before the test
          begins so your attempts are saved to your dashboard.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {tests.map((t) => (
            <div
              key={t.id}
              className="bg-[#F8EFE2] border border-[#E5D5C3] rounded-2xl p-6 flex flex-col"
            >
              <h2 className="text-lg font-semibold text-[#0F172A]">{t.title}</h2>
              <p className="text-sm text-gray-600 mt-2 flex-1">{t.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-pink-600 font-semibold">₹{t.price}</span>
                <Link
                  href={`/test/${t.id}`}
                  className="bg-pink-500 text-white text-sm px-4 py-2 rounded-lg hover:opacity-90"
                >
                  Start paper
                </Link>
              </div>
            </div>
          ))}
        </div>

        {tests.length === 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-950 px-5 py-4 text-sm space-y-2">
            <p className="font-medium">No MCQ papers to show yet.</p>
            <p className="text-amber-900/90">
              Papers appear only when a <strong>published</strong> test series has
              at least one question. If you uploaded a Word file without a Test
              Series ID, add <code className="text-xs bg-white/80 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
              <code className="text-xs bg-white/80 px-1 rounded">.env.local</code>{" "}
              and open this page again — older uploads with no series will be
              grouped automatically. New uploads create a series for you if the
              field is left empty.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
