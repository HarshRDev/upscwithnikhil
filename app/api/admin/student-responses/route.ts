import { createClient } from "@supabase/supabase-js";

/* =========================
   GET → Any student’s responses (service role; for admin UI)
   Set SUPABASE_SERVICE_ROLE_KEY in .env.local
========================= */
export async function GET(req: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || !url) {
    return Response.json(
      {
        error:
          "Admin response lookup requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local",
      },
      { status: 503 }
    );
  }

  const studentId = new URL(req.url).searchParams.get("student_id");
  if (!studentId) {
    return Response.json({ error: "student_id is required" }, { status: 400 });
  }

  const admin = createClient(url, serviceKey);
  const { data, error } = await admin
    .from("student_responses")
    .select("*, mcqs(question, correct_answer, explanation)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
