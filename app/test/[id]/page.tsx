"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";

interface MCQ {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
}

interface UserAnswer {
  [mcqId: string]: string;
}

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const testSeriesId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session: s },
      } = await supabase.auth.getSession();
      setSession(s);
      setAuthChecked(true);

      if (!s) {
        router.replace(
          `/auth/login?next=${encodeURIComponent(`/test/${testSeriesId}`)}`
        );
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/mcqs?test_series_id=${testSeriesId}`);
        const data = await res.json();

        if (!res.ok && data?.error) {
          setLoadError(data.error);
        } else if (Array.isArray(data)) {
          setMcqs(data);
        } else {
          setLoadError("Unexpected response from server.");
        }
      } catch {
        setLoadError("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    if (testSeriesId) init();
  }, [testSeriesId, router]);

  const handleAnswerSelect = (mcqId: string, answer: string) => {
    if (!submitted) {
      setUserAnswers({ ...userAnswers, [mcqId]: answer });
    }
  };

  const handleSubmit = async () => {
    if (!session?.access_token) return;

    for (const mcqId in userAnswers) {
      const answer = userAnswers[mcqId];
      await fetch("/api/student-responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          test_series_id: testSeriesId,
          mcq_id: mcqId,
          student_answer: answer,
        }),
      });
    }

    setSubmitted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    for (const mcqId in userAnswers) {
      const mcq = mcqs.find((m) => m.id === mcqId);
      if (
        mcq &&
        userAnswers[mcqId]?.toUpperCase() === mcq.correct_answer?.toUpperCase()
      ) {
        correct++;
      }
    }
    return { correct, total: mcqs.length };
  };

  if (!authChecked || loading) {
    return (
      <main className="min-h-screen bg-[#F5EBDD] flex items-center justify-center">
        <p className="text-[#0F172A]">Loading test...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#F5EBDD] flex items-center justify-center px-6">
        <p className="text-[#0F172A] text-center">Redirecting to sign in…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-[#F5EBDD] flex items-center justify-center px-6">
        <p className="text-red-700 text-center max-w-md">{loadError}</p>
      </main>
    );
  }

  if (mcqs.length === 0) {
    return (
      <main className="min-h-screen bg-[#F5EBDD] flex items-center justify-center px-6">
        <p className="text-[#0F172A] text-center">
          No MCQs found for this test series.
        </p>
      </main>
    );
  }

  const currentMcq = mcqs[currentIndex];
  const score = calculateScore();
  const optionLabels: Record<string, string> = {
    option_a: "A",
    option_b: "B",
    option_c: "C",
    option_d: "D",
  };
  const options = ["option_a", "option_b", "option_c", "option_d"] as const;

  return (
    <main className="min-h-screen bg-[#F5EBDD] py-8 px-6">
      <div className="max-w-3xl mx-auto">
        {!submitted ? (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h1 className="text-2xl font-bold text-[#0F172A]">
                  Question {currentIndex + 1} of {mcqs.length}
                </h1>
                <span className="text-sm text-gray-600">
                  Answered: {Object.keys(userAnswers).length}/{mcqs.length}
                </span>
              </div>
              <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / mcqs.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h2 className="text-xl font-semibold text-[#0F172A] mb-6">
                {currentMcq.question}
              </h2>

              <div className="space-y-3">
                {options.map((optionKey) => (
                  <label
                    key={optionKey}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      userAnswers[currentMcq.id] === optionLabels[optionKey]
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-300 hover:border-pink-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentMcq.id}
                      value={optionLabels[optionKey]}
                      checked={
                        userAnswers[currentMcq.id] === optionLabels[optionKey]
                      }
                      onChange={(e) =>
                        handleAnswerSelect(currentMcq.id, e.target.value)
                      }
                      disabled={submitted}
                      className="w-4 h-4"
                    />
                    <span className="ml-4 font-medium">
                      {optionLabels[optionKey]}.{" "}
                      {currentMcq[optionKey as keyof MCQ] as string}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <button
                type="button"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-6 py-3 border-2 border-pink-500 text-pink-500 rounded-lg font-medium hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              {currentIndex === mcqs.length - 1 ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:scale-105 transition-all"
                >
                  Submit Test
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:scale-105 transition-all"
                >
                  Next →
                </button>
              )}
            </div>

            <div className="mt-8">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Quick Navigation:
              </p>
              <div className="flex flex-wrap gap-2">
                {mcqs.map((mcq, index) => (
                  <button
                    type="button"
                    key={mcq.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-8 h-8 rounded-lg font-medium transition-all ${
                      userAnswers[mcq.id]
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-700"
                    } ${
                      currentIndex === index
                        ? "ring-2 ring-offset-2 ring-pink-500"
                        : ""
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h2 className="text-3xl font-bold text-[#0F172A] mb-4">
                Test Completed!
              </h2>
              <div className="text-center py-8">
                <p className="text-5xl font-bold text-pink-600 mb-2">
                  {score.correct}/{score.total}
                </p>
                <p className="text-xl text-gray-600">
                  You scored {Math.round((score.correct / score.total) * 100)}%
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-[#0F172A]">
                Review Your Answers
              </h3>

              {mcqs.map((mcq, index) => {
                const isCorrect =
                  userAnswers[mcq.id]?.toUpperCase() ===
                  mcq.correct_answer?.toUpperCase();
                return (
                  <div
                    key={mcq.id}
                    className={`p-6 rounded-lg border-l-4 ${
                      isCorrect
                        ? "bg-green-50 border-green-500"
                        : "bg-red-50 border-red-500"
                    }`}
                  >
                    <h4 className="font-semibold text-[#0F172A] mb-2">
                      Q{index + 1}: {mcq.question}
                    </h4>
                    <p className="text-sm">
                      <strong>Your Answer:</strong> {userAnswers[mcq.id] ?? "—"}
                    </p>
                    <p className="text-sm text-green-700 font-medium">
                      <strong>Correct Answer:</strong> {mcq.correct_answer}
                    </p>
                    {mcq.explanation && (
                      <p className="text-sm text-purple-700 italic mt-2">
                        <strong>Explanation:</strong> {mcq.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full mt-8 bg-pink-500 text-white py-3 rounded-lg font-medium hover:scale-105 transition-all"
            >
              View Dashboard
            </button>
          </>
        )}
      </div>
    </main>
  );
}
