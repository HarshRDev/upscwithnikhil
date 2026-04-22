"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

interface StudentStats {
  total: number;
  correct: number;
  incorrect: number;
  percentage: number;
}

interface StudentResponse {
  id: string;
  mcq_id: string;
  student_answer: string;
  is_correct: boolean;
  created_at: string;
  mcqs: {
    question: string;
    correct_answer: string;
    explanation: string;
  };
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [studentName, setStudentName] = useState("Student");
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminError, setAdminError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setAdminError(null);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          router.replace("/auth/login?next=/admin");
          return;
        }

        const authHeaders = {
          Authorization: `Bearer ${session.access_token}`,
        };

        const profileRes = await fetch("/api/profile", { headers: authHeaders });
        const profile = await profileRes.json();
        const role = String(profile?.role ?? "")
          .trim()
          .toLowerCase();
        if (!profileRes.ok || (role !== "admin" && role !== "superadmin")) {
          router.replace("/not-authorized");
          return;
        }

        // Fetch student info
        const studentRes = await fetch(`/api/admin/students?id=${studentId}`, {
          headers: authHeaders,
        });
        const studentData = await studentRes.json();

        if (Array.isArray(studentData) && studentData.length > 0) {
          setStudentName(studentData[0].name || "Student");
        }

        // Fetch student responses
        const responsesRes = await fetch(
          `/api/admin/student-responses?student_id=${studentId}`,
          { headers: authHeaders }
        );
        const responsesData = await responsesRes.json();

        if (!responsesRes.ok) {
          setAdminError(
            (responsesData?.error as string) ||
              "Could not load student responses."
          );
        } else if (Array.isArray(responsesData)) {
          setResponses(responsesData);

          const total = responsesData.length;
          const correct = responsesData.filter(
            (r: StudentResponse) => r.is_correct
          ).length;

          setStats({
            total,
            correct,
            incorrect: total - correct,
            percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
          });
        } else {
          setAdminError("Could not load student responses.");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchData();
    }
  }, [studentId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5EBDD] flex items-center justify-center">
        <p className="text-[#0F172A] text-lg">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5EBDD] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-pink-500 hover:underline mb-6"
        >
          ← Back to Students
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0F172A] mb-2">
            {studentName}
          </h1>
          <p className="text-gray-600">Performance Analytics</p>
        </div>

        {adminError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-sm">
            {adminError}
          </div>
        )}

        {/* Scorecard Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Questions */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium">Total Questions</p>
            <p className="text-3xl font-bold text-[#0F172A] mt-2">
              {stats?.total || 0}
            </p>
          </div>

          {/* Correct Answers */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Correct Answers</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats?.correct || 0}
            </p>
          </div>

          {/* Incorrect Answers */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-500">
            <p className="text-gray-600 text-sm font-medium">Incorrect Answers</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {stats?.incorrect || 0}
            </p>
          </div>

          {/* Accuracy Percentage */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-pink-500">
            <p className="text-gray-600 text-sm font-medium">Accuracy</p>
            <p className="text-3xl font-bold text-pink-600 mt-2">
              {stats?.percentage || 0}%
            </p>
          </div>
        </div>

        {/* Completion Bar */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-[#0F172A] mb-4">
            Completion Progress
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium">Overall Progress</span>
                <span className="text-pink-600 font-bold">{stats?.percentage || 0}%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-pink-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${stats?.percentage || 0}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 text-sm">Correct Attempts</span>
                  <span className="text-green-600 font-semibold">
                    {stats?.correct}/{stats?.total}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${stats?.total ? (stats.correct / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 text-sm">Incorrect Attempts</span>
                  <span className="text-red-600 font-semibold">
                    {stats?.incorrect}/{stats?.total}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{
                      width: `${stats?.total ? (stats.incorrect / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Responses */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">
            Answer Details
          </h2>

          {responses.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No responses recorded yet
            </p>
          ) : (
            <div className="space-y-6">
              {responses.map((response, index) => (
                <div
                  key={response.id}
                  className={`p-6 rounded-lg border-l-4 ${
                    response.is_correct
                      ? "bg-green-50 border-green-500"
                      : "bg-red-50 border-red-500"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-[#0F172A]">
                      Q{index + 1}: {response.mcqs?.question}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        response.is_correct
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {response.is_correct ? "✓ Correct" : "✗ Incorrect"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <strong>Student Answer:</strong> {response.student_answer}
                    </p>
                    <p className="text-green-700 font-medium">
                      <strong>Correct Answer:</strong>{" "}
                      {response.mcqs?.correct_answer}
                    </p>
                    {response.mcqs?.explanation && (
                      <p className="text-purple-700 italic">
                        <strong>Explanation:</strong> {response.mcqs.explanation}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Attempted on:{" "}
                    {new Date(response.created_at).toLocaleDateString()} at{" "}
                    {new Date(response.created_at).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
