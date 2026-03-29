"use client";

import { useState } from "react";

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        price: Number(price),
        is_published: true,
      }),
    });

    const data = await res.json();
    console.log(data);

    alert("✅ Course created successfully!");

    setTitle("");
    setDescription("");
    setPrice("");
  };

  return (
    <main className="min-h-screen bg-[#F5EBDD] flex items-center justify-center px-6">

      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl border border-gray-200">

        <h1 className="text-2xl font-bold text-[#0F172A] mb-6">
          Create Course
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* TITLE */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Course Title
            </label>
            <input
              type="text"
              placeholder="Enter course title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 border border-gray-300 p-3 rounded-lg 
              bg-white text-[#0F172A] placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              placeholder="Enter course description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 border border-gray-300 p-3 rounded-lg 
              bg-white text-[#0F172A] placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-pink-400"
              rows={4}
              required
            />
          </div>

          {/* PRICE */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Price (₹)
            </label>
            <input
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full mt-1 border border-gray-300 p-3 rounded-lg 
              bg-white text-[#0F172A] placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-linear-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Create Course
          </button>

        </form>

      </div>

    </main>
  );
}