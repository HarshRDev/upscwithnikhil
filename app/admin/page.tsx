"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

async function jsonAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) {
    h.Authorization = `Bearer ${session.access_token}`;
  }
  return h;
}

type Tab = "articles" | "courses" | "testseries" | "mcqs" | "students";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("articles");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [uploadMode, setUploadMode] = useState<"json" | "word">("json");

  // Article Form State
  const [articleData, setArticleData] = useState({
    title: "",
    content: "",
  });

  // Course Form State
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: "",
  });

  // Test Series Form State
  const [testSeriesData, setTestSeriesData] = useState({
    title: "",
    description: "",
    price: "",
    total_tests: "",
    duration: "",
  });

  // MCQ Form State
  const [mcqData, setMCQData] = useState({
    test_series_id: "",
    mcqJson: "",
  });

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
  };

  // Handle Word File Upload
  const handleWordFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "mcq");

      const parseRes = await fetch("/api/parse-word", {
        method: "POST",
        body: formData,
      });

      const parseData = await parseRes.json();

      if (!parseRes.ok) {
        throw new Error(parseData.error || "Failed to parse Word file");
      }

      const { mcqs, count } = parseData;

      // Send parsed MCQs to API
      const res = await fetch("/api/mcqs", {
        method: "POST",
        headers: await jsonAuthHeaders(),
        body: JSON.stringify({
          mcqs,
          test_series_id: mcqData.test_series_id || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to upload MCQs");

      const sid = data.test_series_id ? ` Test series ID: ${data.test_series_id}` : "";
      showMessage(`✅ Successfully uploaded ${count} MCQs!${sid}`);
      setMCQData({ test_series_id: "", mcqJson: "" });
      e.target.value = ""; // Reset file input
    } catch (error) {
      showMessage(`❌ Error: ${error instanceof Error ? error.message : "Failed to parse Word file"}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle MCQ Submit
  const handleMCQSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const mcqs = JSON.parse(mcqData.mcqJson);

      if (!Array.isArray(mcqs)) {
        throw new Error("MCQ data must be an array");
      }

      const res = await fetch("/api/mcqs", {
        method: "POST",
        headers: await jsonAuthHeaders(),
        body: JSON.stringify({
          mcqs,
          test_series_id: mcqData.test_series_id || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create MCQs");

      const sid = data.test_series_id ? ` ID: ${data.test_series_id}` : "";
      showMessage(`✅ ${data.message}${sid}`);
      setMCQData({ test_series_id: "", mcqJson: "" });
    } catch (error) {
      showMessage(`❌ Error: ${error instanceof Error ? error.message : "Invalid JSON format"}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();

      if (Array.isArray(data)) {
        setStudents(data);
      }
    } catch (error) {
      showMessage("❌ Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleArticleWordUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "article");
      if (articleData.title.trim()) {
        formData.append("article_title", articleData.title.trim());
      }

      const parseRes = await fetch("/api/parse-word", {
        method: "POST",
        body: formData,
      });
      const parseData = await parseRes.json();
      if (!parseRes.ok) {
        throw new Error(parseData.error || "Failed to read Word file");
      }
      setArticleData({
        title: parseData.title || articleData.title,
        content: parseData.content || "",
      });
      showMessage("✅ Article text loaded from Word — review and click Create Article.");
      e.target.value = "";
    } catch (err) {
      showMessage(
        `❌ ${err instanceof Error ? err.message : "Failed to import Word"}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Article Submit
  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: await jsonAuthHeaders(),
        body: JSON.stringify(articleData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create article");

      showMessage("✅ Article created successfully!");
      setArticleData({ title: "", content: "" });
    } catch (error) {
      showMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Course Submit
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: await jsonAuthHeaders(),
        body: JSON.stringify({
          ...courseData,
          price: Number(courseData.price),
          is_published: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create course");

      showMessage("✅ Course created successfully!");
      setCourseData({ title: "", description: "", price: "" });
    } catch (error) {
      showMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Test Series Submit
  const handleTestSeriesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/testseries", {
        method: "POST",
        headers: await jsonAuthHeaders(),
        body: JSON.stringify({
          ...testSeriesData,
          price: Number(testSeriesData.price),
          total_tests: Number(testSeriesData.total_tests),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create test series");

      showMessage("✅ Test Series created successfully!");
      setTestSeriesData({
        title: "",
        description: "",
        price: "",
        total_tests: "",
        duration: "",
      });
    } catch (error) {
      showMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5EBDD] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0F172A] mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage articles, courses, and test series</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="flex flex-wrap border-b border-gray-200">
            <button
              onClick={() => setActiveTab("articles")}
              className={`flex-1 min-w-max py-4 px-6 font-medium transition-all ${
                activeTab === "articles"
                  ? "bg-pink-500 text-white border-b-4 border-pink-600"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              📰 Articles
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`flex-1 min-w-max py-4 px-6 font-medium transition-all ${
                activeTab === "courses"
                  ? "bg-pink-500 text-white border-b-4 border-pink-600"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              📚 Courses
            </button>
            <button
              onClick={() => setActiveTab("testseries")}
              className={`flex-1 min-w-max py-4 px-6 font-medium transition-all ${
                activeTab === "testseries"
                  ? "bg-pink-500 text-white border-b-4 border-pink-600"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              ✏️ Test Series
            </button>
            <button
              onClick={() => setActiveTab("mcqs")}
              className={`flex-1 min-w-max py-4 px-6 font-medium transition-all ${
                activeTab === "mcqs"
                  ? "bg-pink-500 text-white border-b-4 border-pink-600"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              ❓ MCQs
            </button>
            <button
              onClick={() => {
                setActiveTab("students");
                fetchStudents();
              }}
              className={`flex-1 min-w-max py-4 px-6 font-medium transition-all ${
                activeTab === "students"
                  ? "bg-pink-500 text-white border-b-4 border-pink-600"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              👥 Students
            </button>
          </div>

          {/* Message Alert */}
          {message && (
            <div className={`p-4 ${message.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message}
            </div>
          )}

          {/* Form Content */}
          <div className="p-8">
            {/* ARTICLES TAB */}
            {activeTab === "articles" && (
              <form onSubmit={handleArticleSubmit} className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Create Article</h2>

                {/* Article Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={articleData.title}
                    onChange={(e) =>
                      setArticleData({ ...articleData, title: e.target.value })
                    }
                    placeholder="Enter article title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                {/* Article Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Content *
                  </label>
                  <textarea
                    value={articleData.content}
                    onChange={(e) =>
                      setArticleData({ ...articleData, content: e.target.value })
                    }
                    placeholder="Enter article content..."
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Import from Word (.docx)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Plain text is extracted. First line becomes the title unless
                    you entered a title above (then that title overrides).
                  </p>
                  <input
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleArticleWordUpload}
                    disabled={loading}
                    className="w-full text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-pink-500 text-white py-3 rounded-lg font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Article"}
                </button>
              </form>
            )}

            {/* COURSES TAB */}
            {activeTab === "courses" && (
              <form onSubmit={handleCourseSubmit} className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Create Course</h2>

                {/* Course Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) =>
                      setCourseData({ ...courseData, title: e.target.value })
                    }
                    placeholder="Enter course title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                {/* Course Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Description *
                  </label>
                  <textarea
                    value={courseData.description}
                    onChange={(e) =>
                      setCourseData({ ...courseData, description: e.target.value })
                    }
                    placeholder="Enter course description..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                {/* Course Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={courseData.price}
                    onChange={(e) =>
                      setCourseData({ ...courseData, price: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-pink-500 text-white py-3 rounded-lg font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Course"}
                </button>
              </form>
            )}

            {/* TEST SERIES TAB */}
            {activeTab === "testseries" && (
              <form onSubmit={handleTestSeriesSubmit} className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Create Test Series</h2>

                {/* Test Series Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Series Title *
                  </label>
                  <input
                    type="text"
                    value={testSeriesData.title}
                    onChange={(e) =>
                      setTestSeriesData({ ...testSeriesData, title: e.target.value })
                    }
                    placeholder="Enter test series title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                {/* Test Series Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Series Description *
                  </label>
                  <textarea
                    value={testSeriesData.description}
                    onChange={(e) =>
                      setTestSeriesData({ ...testSeriesData, description: e.target.value })
                    }
                    placeholder="Enter test series description..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={testSeriesData.price}
                    onChange={(e) =>
                      setTestSeriesData({ ...testSeriesData, price: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                {/* Total Tests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Tests *
                  </label>
                  <input
                    type="number"
                    value={testSeriesData.total_tests}
                    onChange={(e) =>
                      setTestSeriesData({ ...testSeriesData, total_tests: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (days) (Optional)
                  </label>
                  <input
                    type="number"
                    value={testSeriesData.duration}
                    onChange={(e) =>
                      setTestSeriesData({ ...testSeriesData, duration: e.target.value })
                    }
                    placeholder="30"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-pink-500 text-white py-3 rounded-lg font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Test Series"}
                </button>
              </form>
            )}

            {/* MCQs TAB */}
            {activeTab === "mcqs" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Upload MCQs</h2>

                {/* Upload Mode Toggle */}
                <div className="flex gap-4 border-b border-gray-300">
                  <button
                    onClick={() => setUploadMode("word")}
                    className={`py-3 px-6 font-medium transition-all ${
                      uploadMode === "word"
                        ? "border-b-2 border-pink-500 text-pink-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    📄 Upload Word File
                  </button>
                  <button
                    onClick={() => setUploadMode("json")}
                    className={`py-3 px-6 font-medium transition-all ${
                      uploadMode === "json"
                        ? "border-b-2 border-pink-500 text-pink-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    📋 Paste JSON
                  </button>
                </div>

                {/* Test Series ID (Common for both modes) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Series ID (optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Leave empty to auto-create a published paper; or paste an
                    existing series UUID to add questions to that paper.
                  </p>
                  <input
                    type="text"
                    value={mcqData.test_series_id}
                    onChange={(e) =>
                      setMCQData({ ...mcqData, test_series_id: e.target.value })
                    }
                    placeholder="Empty = new paper on MCQ papers page"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* WORD FILE UPLOAD MODE */}
                {uploadMode === "word" && (
                  <div className="space-y-6">
                    {/* Word Format Guide */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-3">
                        📝 Word Document Format Guide:
                      </h3>
                      <div className="text-sm text-green-800 space-y-2">
                        <p>Format your MCQs in the Word document as follows:</p>
                        <div className="bg-white p-3 rounded border border-green-300 font-mono text-xs">
                          <p>Q1: What is the capital of India?</p>
                          <p>A) Mumbai</p>
                          <p>B) New Delhi</p>
                          <p>C) Kolkata</p>
                          <p>D) Bangalore</p>
                          <p>Answer: B</p>
                          <p>Explanation: New Delhi is the capital</p>
                          <br />
                          <p>Q2: How many states...</p>
                        </div>
                        <ul className="list-disc list-inside space-y-1 mt-3">
                          <li>Use Q1:, Q2:, Q3: to mark questions</li>
                          <li>Use A), B), C), D) for options</li>
                          <li>Use "Answer: X" to specify correct option</li>
                          <li>Use "Explanation:" for optional explanations</li>
                        </ul>
                      </div>
                    </div>

                    {/* File Upload Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Word File (.docx) *
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".docx,.doc"
                          onChange={handleWordFileUpload}
                          disabled={loading}
                          className="hidden"
                          id="word-file-input"
                        />
                        <label
                          htmlFor="word-file-input"
                          className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-pink-300 rounded-lg cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all disabled:opacity-50"
                        >
                          <span className="flex flex-col items-center">
                            <span className="text-3xl mb-2">📄</span>
                            <span className="text-sm font-medium text-gray-700">
                              Click to upload Word file or drag and drop
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              .docx or .doc files accepted
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>

                    {loading && (
                      <p className="text-center text-pink-600 font-medium">
                        Parsing Word file...
                      </p>
                    )}
                  </div>
                )}

                {/* JSON INPUT MODE */}
                {uploadMode === "json" && (
                  <form onSubmit={handleMCQSubmit} className="space-y-6">
                    {/* Helper Text */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        📋 JSON Format Guide:
                      </h3>
                      <code className="text-sm bg-white p-3 rounded block overflow-x-auto text-blue-800">
                        {`[
  {
    "question": "What is the capital of India?",
    "option_a": "Mumbai",
    "option_b": "New Delhi",
    "option_c": "Kolkata",
    "option_d": "Bangalore",
    "correct_answer": "B",
    "explanation": "New Delhi is the capital"
  }
]`}
                      </code>
                    </div>

                    {/* MCQ JSON */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        MCQ Data (JSON) *
                      </label>
                      <textarea
                        value={mcqData.mcqJson}
                        onChange={(e) =>
                          setMCQData({ ...mcqData, mcqJson: e.target.value })
                        }
                        placeholder="Paste your MCQ JSON here"
                        rows={12}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono text-sm"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-pink-500 text-white py-3 rounded-lg font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Uploading..." : "Upload MCQs"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* STUDENTS TAB */}
            {activeTab === "students" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Student Profiles</h2>

                {students.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No students found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b border-gray-300">
                        <tr>
                          <th className="px-4 py-3 text-left">Name</th>
                          <th className="px-4 py-3 text-left">Email</th>
                          <th className="px-4 py-3 text-left">Joined</th>
                          <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student: any) => (
                          <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-[#0F172A]">
                              {student.name || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{student.email}</td>
                            <td className="px-4 py-3 text-gray-600">
                              {new Date(student.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <a
                                href={`/admin/student/${student.id}`}
                                className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 inline-block"
                              >
                                View Profile
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}