"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabaseClient";

interface StudentStats {
  total: number;
  correct: number;
  incorrect: number;
  percentage: number;
}

interface TestSeriesStats {
  test_series_id: string;
  title: string;
  total: number;
  correct: number;
  percentage: number;
}

interface CourseRow {
  id: string;
  title: string;
  description: string;
  price: number;
}

interface TestSeriesRow {
  id: string;
  title: string;
  description: string;
  price: number;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [overallStats, setOverallStats] = useState<StudentStats | null>(null);
  const [testStats, setTestStats] = useState<TestSeriesStats[]>([]);
  const [myCourses, setMyCourses] = useState<CourseRow[]>([]);
  const [myTests, setMyTests] = useState<TestSeriesRow[]>([]);
  const [accessNote, setAccessNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace("/auth/login?next=/dashboard");
        return;
      }

      const authHeaders = {
        Authorization: `Bearer ${session.access_token}`,
      };

      try {
        const [responsesRes, seriesRes, accessRes] = await Promise.all([
          fetch("/api/student-responses", { headers: authHeaders }),
          fetch("/api/testseries"),
          fetch("/api/student/access", { headers: authHeaders }),
        ]);

        const responses = await responsesRes.json();
        const allTestSeries: TestSeriesRow[] = await seriesRes.json();
        const accessPayload = await accessRes.json();

        if (accessPayload.entitlementsError) {
          setAccessNote(
            `Access: ${accessPayload.entitlementsError}. Run db/platform_extensions.sql and ensure RLS on purchases allows users to read their own rows.`
          );
        }

        if (Array.isArray(accessPayload.courses)) {
          setMyCourses(accessPayload.courses);
        }
        if (Array.isArray(accessPayload.testSeries)) {
          setMyTests(accessPayload.testSeries);
        }

        const titleById: Record<string, string> = {};
        if (Array.isArray(allTestSeries)) {
          for (const t of allTestSeries) {
            titleById[t.id] = t.title;
          }
        }

        if (Array.isArray(responses)) {
          const total = responses.length;
          const correct = responses.filter(
            (r: { is_correct: boolean }) => r.is_correct
          ).length;

          setOverallStats({
            total,
            correct,
            incorrect: total - correct,
            percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
          });

          const grouped = responses.reduce(
            (
              acc: Record<
                string,
                {
                  test_series_id: string;
                  title: string;
                  total: number;
                  correct: number;
                }
              >,
              resp: { test_series_id: string; is_correct: boolean }
            ) => {
              const testId = resp.test_series_id;
              if (!acc[testId]) {
                acc[testId] = {
                  test_series_id: testId,
                  title: titleById[testId] || `Test series`,
                  total: 0,
                  correct: 0,
                };
              }
              acc[testId].total++;
              if (resp.is_correct) acc[testId].correct++;
              return acc;
            },
            {}
          );

          const stats = (Object.values(grouped) as Omit<
            TestSeriesStats,
            "percentage"
          >[]).map((stat) => ({
            ...stat,
            percentage: Math.round((stat.correct / stat.total) * 100),
          }));

          setTestStats(stats);
        } else if (responses?.error) {
          setAccessNote((prev) =>
            prev
              ? `${prev} Responses: ${responses.error}`
              : `Responses: ${responses.error}`
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#F5EBDD] py-12 px-6">
      <Navbar />
      <div className="max-w-5xl mx-auto pt-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0F172A] mb-2">
            My Dashboard
          </h1>
          <p className="text-gray-600">Track your learning progress</p>
        </div>

        {accessNote && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-sm">
            {accessNote}
          </div>
        )}

        {!loading && (
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#E5D5C3]">
              <h2 className="text-lg font-bold text-[#0F172A] mb-4">
                My courses
              </h2>
              {myCourses.length === 0 ? (
                <>
                  <p className="text-sm text-gray-600">
                    You do not have any active course enrollments at the moment.
                    Once a course purchase is confirmed, it will appear here.
                  </p>
                  <Link
                    href="/courses"
                    className="inline-block mt-4 text-sm text-pink-600 hover:underline"
                  >
                    Browse all published courses
                  </Link>
                </>
              ) : (
                <ul className="space-y-3">
                  {myCourses.map((c) => (
                    <li
                      key={c.id}
                      className="flex justify-between gap-4 text-sm border-b border-gray-100 pb-2"
                    >
                      <span className="font-medium text-[#0F172A]">
                        {c.title}
                      </span>
                      <span className="text-pink-600 shrink-0">₹{c.price}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#E5D5C3]">
              <h2 className="text-lg font-bold text-[#0F172A] mb-4">
                My test series
              </h2>
              {myTests.length === 0 ? (
                <p className="text-sm text-gray-600">
                  You do not have any active test series enrollments at the
                  moment. Once a test series purchase is confirmed, it will
                  appear here.
                </p>
              ) : (
                <ul className="space-y-3">
                  {myTests.map((t) => (
                    <li
                      key={t.id}
                      className="flex flex-wrap items-center justify-between gap-2 text-sm border-b border-gray-100 pb-2"
                    >
                      <span className="font-medium text-[#0F172A]">
                        {t.title}
                      </span>
                      <Link
                        href={`/test/${t.id}`}
                        className="text-pink-600 font-medium hover:underline"
                      >
                        Start test →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/tests"
                className="inline-block mt-4 text-sm text-pink-600 hover:underline"
              >
                Browse all published tests
              </Link>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Total Questions
                    </p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {overallStats?.total || 0}
                    </p>
                  </div>
                  <span className="text-4xl">❓</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Correct Answers
                    </p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {overallStats?.correct || 0}
                    </p>
                  </div>
                  <span className="text-4xl">✓</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-500 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Incorrect Answers
                    </p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                      {overallStats?.incorrect || 0}
                    </p>
                  </div>
                  <span className="text-4xl">✗</span>
                </div>
              </div>

              <div className="bg-linear-to-br from-pink-500 to-purple-500 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Accuracy</p>
                    <p className="text-3xl font-bold mt-2">
                      {overallStats?.percentage || 0}%
                    </p>
                  </div>
                  <span className="text-4xl">⚡</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-6">
                Overall Progress
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-700 font-semibold text-lg">
                      Completion Score
                    </span>
                    <span className="text-3xl font-bold text-pink-600">
                      {overallStats?.percentage || 0}%
                    </span>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-1000"
                      style={{
                        width: `${overallStats?.percentage || 0}%`,
                        boxShadow: "0 0 10px rgba(236, 72, 153, 0.5)",
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium">
                        Correct Rate
                      </span>
                      <span className="text-green-600 font-bold">
                        {overallStats?.correct}/{overallStats?.total}
                      </span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${
                            overallStats?.total
                              ? (overallStats.correct / overallStats.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium">
                        Error Rate
                      </span>
                      <span className="text-red-600 font-bold">
                        {overallStats?.incorrect}/{overallStats?.total}
                      </span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{
                          width: `${
                            overallStats?.total
                              ? (overallStats.incorrect / overallStats.total) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {testStats.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-[#0F172A] mb-6">
                  Test Series Performance
                </h2>

                <div className="space-y-6">
                  {testStats.map((test) => (
                    <div
                      key={test.test_series_id}
                      className="p-6 border-2 border-gray-200 rounded-lg hover:border-pink-500 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-[#0F172A]">
                          {test.title}
                        </h3>
                        <span className="text-2xl font-bold text-pink-600">
                          {test.percentage}%
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {test.correct} correct out of {test.total} questions
                      </p>

                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-pink-500 to-purple-500"
                          style={{ width: `${test.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {overallStats?.total === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-4xl mb-4">📝</p>
                <h3 className="text-xl font-semibold text-[#0F172A] mb-2">
                  No Progress Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start taking tests to see your performance analytics
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/tests")}
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:scale-105 transition-all"
                >
                  View tests
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
