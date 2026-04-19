import { createClient } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";
import {
  bearerTokenFromRequest,
  getUserIdFromRequest,
} from "../../lib/authFromRequest";

function supabaseForUser(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

/* =========================
   GET → Current user’s responses (Bearer JWT required)
========================= */
export async function GET(req: Request) {
  try {
    const token = bearerTokenFromRequest(req);
    const userId = await getUserIdFromRequest(req);
    if (!token || !userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const testSeriesId = searchParams.get("test_series_id");

    const db = supabaseForUser(token);

    let query = db
      .from("student_responses")
      .select("*, mcqs(question, explanation)")
      .eq("student_id", userId);

    if (testSeriesId) {
      query = query.eq("test_series_id", testSeriesId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch {
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

/* =========================
   POST → Submit answer (Bearer JWT; correctness from DB)
========================= */
export async function POST(req: Request) {
  try {
    const token = bearerTokenFromRequest(req);
    const userId = await getUserIdFromRequest(req);
    if (!token || !userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { test_series_id, mcq_id, student_answer } = body;

    if (!test_series_id || !mcq_id || student_answer == null || student_answer === "") {
      return Response.json(
        { error: "Missing test_series_id, mcq_id, or student_answer" },
        { status: 400 }
      );
    }

    const { data: mcq, error: mcqError } = await supabase
      .from("mcqs")
      .select("correct_answer")
      .eq("id", mcq_id)
      .maybeSingle();

    if (mcqError || !mcq?.correct_answer) {
      return Response.json({ error: "Question not found" }, { status: 404 });
    }

    const normalized = String(student_answer).trim().toUpperCase();
    const correct = String(mcq.correct_answer).trim().toUpperCase();
    const is_correct = normalized === correct;

    const db = supabaseForUser(token);

    const { data, error } = await db
      .from("student_responses")
      .insert([
        {
          student_id: userId,
          test_series_id,
          mcq_id,
          student_answer: normalized,
          is_correct,
        },
      ])
      .select();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
