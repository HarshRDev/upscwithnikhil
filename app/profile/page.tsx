"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabaseClient";

type ProfilePayload = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace("/auth/login?next=/profile");
        return;
      }

      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await res.json();

      if (!res.ok) {
        setError(payload?.error || "Failed to load profile");
        setLoading(false);
        return;
      }

      setProfile(payload);
      setName(payload.name ?? "");
      setLoading(false);
    };

    load();
  }, [router]);

  const saveProfile = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      router.replace("/auth/login?next=/profile");
      return;
    }

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ name: name.trim() }),
    });
    const payload = await res.json();

    if (!res.ok) {
      setError(payload?.error || "Failed to save profile");
      setSaving(false);
      return;
    }

    setProfile((prev) => (prev ? { ...prev, name: name.trim() } : prev));
    setMessage("Profile updated successfully.");
    setSaving(false);
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      router.replace("/auth/login?next=/profile");
      return;
    }

    const res = await fetch("/api/profile", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const payload = await res.json();

    if (!res.ok) {
      setError(payload?.error || "Failed to delete account");
      setDeleting(false);
      return;
    }

    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#F5EBDD] py-12 px-6">
      <Navbar />
      <div className="max-w-3xl mx-auto pt-8">
        <h1 className="text-4xl font-bold text-[#0F172A] mb-2">My profile</h1>
        <p className="text-gray-600 mb-8">View and manage your account details</p>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#E5D5C3]">
          {loading ? (
            <p className="text-gray-600">Loading profile...</p>
          ) : (
            <div className="space-y-5">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {message}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-[#0F172A] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-[#0F172A]">
                    {profile?.email ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="font-medium text-[#0F172A] capitalize">
                    {profile?.role ?? "student"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500">User ID</p>
                  <p className="font-mono text-xs text-[#0F172A] break-all">
                    {profile?.id ?? "—"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving || deleting}
                  className="bg-pink-500 text-white px-5 py-2 rounded-lg font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>

                <button
                  type="button"
                  onClick={deleteAccount}
                  disabled={saving || deleting}
                  className="bg-white text-red-600 px-5 py-2 rounded-lg font-medium border border-red-400 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
