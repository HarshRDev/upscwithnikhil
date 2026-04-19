import { supabase } from "../../lib/supabaseClient";
import {
  adminWriteUnauthorizedResponse,
  supabaseForAdminWrite,
} from "../../lib/supabaseServiceAdmin";

/* =========================
   GET → Fetch all MCQs
========================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const testSeriesId = searchParams.get("test_series_id");

    let query = supabase.from("mcqs").select("*");

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
  } catch (err) {
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

/* =========================
   POST → Create MCQs (JSON array or Word-parsed payload)
========================= */
type McqInput = {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string | null;
};

export async function POST(req: Request) {
  try {
    const db = supabaseForAdminWrite(req);
    if (!db) return adminWriteUnauthorizedResponse();

    const body = await req.json();

    const { mcqs, test_series_id } = body;

    if (!Array.isArray(mcqs) || mcqs.length === 0) {
      return Response.json(
        { error: "MCQs array is required" },
        { status: 400 }
      );
    }

    let seriesId =
      typeof test_series_id === "string" ? test_series_id.trim() : "";
    if (!seriesId) {
      const { data: newSeries, error: seriesErr } = await db
        .from("test_series")
        .insert([
          {
            title: `MCQ paper · ${new Date().toLocaleDateString("en-IN")}`,
            description: `${mcqs.length} questions (auto-created because no test series was selected).`,
            price: 0,
            total_tests: 1,
            is_published: true,
          },
        ])
        .select("id")
        .single();

      if (seriesErr || !newSeries?.id) {
        return Response.json(
          { error: seriesErr?.message ?? "Could not create test series" },
          { status: 500 }
        );
      }
      seriesId = newSeries.id as string;
    }

    const { data, error } = await db
      .from("mcqs")
      .insert(
        (mcqs as McqInput[]).map((mcq) => ({
          test_series_id: seriesId,
          question: mcq.question,
          option_a: mcq.option_a,
          option_b: mcq.option_b,
          option_c: mcq.option_c,
          option_d: mcq.option_d,
          correct_answer: String(mcq.correct_answer).toUpperCase(),
          explanation: mcq.explanation || null,
        }))
      )
      .select();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: `${data.length} MCQs created successfully`,
      test_series_id: seriesId,
      data,
    });
  } catch (err) {
    return Response.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
