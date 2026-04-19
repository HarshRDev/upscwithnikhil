"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

interface CourseRow {
  id: string;
  title: string;
  description: string;
  price: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        if (Array.isArray(data)) setCourses(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <main className="min-h-screen bg-[#F5EBDD]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Courses</h1>
        <p className="text-gray-600 mb-8">
          Explore published programs. Purchased or assigned courses also appear
          on your dashboard.
        </p>

        {loading ? (
          <p className="text-gray-600">Loading…</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div
                key={c.id}
                className="bg-[#F8EFE2] border border-[#E5D5C3] rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold text-[#0F172A]">
                  {c.title}
                </h2>
                <p className="text-sm text-gray-600 mt-2">{c.description}</p>
                <p className="text-pink-600 font-semibold mt-4">₹{c.price}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && courses.length === 0 && (
          <p className="text-gray-600">No published courses yet.</p>
        )}
      </div>
    </main>
  );
}
