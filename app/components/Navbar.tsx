"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import Logo from "./Logo";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#F5EBDD]/80 border-b border-[#E5D5C3]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-y-3">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        <div className="flex flex-1 min-w-0 items-center justify-center gap-5 text-sm text-gray-700 md:flex-none md:justify-start">
          <Link href="/courses" className="hover:text-black transition">
            Courses
          </Link>
          <Link
            href="/tests"
            className="font-semibold text-pink-600 hover:text-pink-700 transition"
          >
            MCQ papers
          </Link>
          <Link href="/#articles" className="hover:text-black transition">
            Articles
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-gray-700 hover:text-black transition"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-white text-pink-500 px-4 py-2 rounded-lg text-sm border border-pink-500 hover:scale-105 hover:shadow-md transition-all duration-200"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className="bg-white text-pink-500 px-4 py-2 rounded-lg text-sm border border-pink-500 hover:scale-105 hover:shadow-md transition-all duration-200"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => router.push("/auth/signup")}
                className="bg-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:scale-105 hover:shadow-md transition-all duration-200"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
