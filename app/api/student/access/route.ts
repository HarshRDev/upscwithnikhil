import { createClient } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabaseClient";
import {
  bearerTokenFromRequest,
  getUserIdFromRequest,
} from "../../../lib/authFromRequest";

/** Purchase rows we treat as “access granted” */
const PAID_STATUSES = ["paid", "completed", "success", "succeeded", "active"];

/* =========================
   GET → Courses & test series from public.purchases (your schema)
========================= */
export async function GET(req: Request) {
  try {
    const token = bearerTokenFromRequest(req);
    const userId = await getUserIdFromRequest(req);
    if (!token || !userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return Response.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const supabaseAuthed = createClient(url, key, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: purchaseRows, error } = await supabaseAuthed
      .from("purchases")
      .select("course_id, test_series_id, status")
      .eq("user_id", userId);

    if (error) {
      console.error("purchases:", error.message);
      return Response.json({
        courses: [],
        testSeries: [],
        entitlementsError: error.message,
      });
    }

    const rows = purchaseRows ?? [];
    const granted = rows.filter((r) => {
      if (r.status == null || String(r.status).trim() === "") return true;
      return PAID_STATUSES.includes(String(r.status).toLowerCase());
    });

    const courseIds = [
      ...new Set(
        granted
          .map((r) => r.course_id)
          .filter((id): id is string => Boolean(id))
      ),
    ];
    const testIds = [
      ...new Set(
        granted
          .map((r) => r.test_series_id)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const [coursesRes, testsRes] = await Promise.all([
      courseIds.length
        ? supabase.from("courses").select("*").in("id", courseIds)
        : Promise.resolve({ data: [] as unknown[], error: null }),
      testIds.length
        ? supabase.from("test_series").select("*").in("id", testIds)
        : Promise.resolve({ data: [] as unknown[], error: null }),
    ]);

    return Response.json({
      courses: coursesRes.data ?? [],
      testSeries: testsRes.data ?? [],
    });
  } catch {
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
