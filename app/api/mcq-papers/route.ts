import { createClient } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";

const POOL_TITLE = "Imported MCQs (no series)";

/* =========================
   GET → Published test_series rows that actually have MCQs.
   If SUPABASE_SERVICE_ROLE_KEY is set, MCQs with null test_series_id are
   attached to a pool series so they show up here.
========================= */
export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url) {
      return Response.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { count: orphanCount, error: orphanErr } = await supabase
      .from("mcqs")
      .select("*", { count: "exact", head: true })
      .is("test_series_id", null);

    if (
      !orphanErr &&
      orphanCount != null &&
      orphanCount > 0 &&
      service &&
      service.length > 0
    ) {
      const admin = createClient(url, service, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: pool } = await admin
        .from("test_series")
        .select("id")
        .eq("title", POOL_TITLE)
        .maybeSingle();

      let poolId = pool?.id as string | undefined;
      if (!poolId) {
        const { data: created, error: createErr } = await admin
          .from("test_series")
          .insert([
            {
              title: POOL_TITLE,
              description:
                "MCQs uploaded without a test series ID (grouped automatically).",
              price: 0,
              total_tests: 1,
              is_published: true,
            },
          ])
          .select("id")
          .single();
        if (createErr) {
          console.error("mcq-papers pool series:", createErr.message);
        } else {
          poolId = created?.id;
        }
      }

      if (poolId) {
        await admin
          .from("mcqs")
          .update({ test_series_id: poolId })
          .is("test_series_id", null);
      }
    }

    const { data: mcqRows, error: mErr } = await supabase
      .from("mcqs")
      .select("test_series_id")
      .not("test_series_id", "is", null);

    if (mErr) {
      return Response.json({ error: mErr.message }, { status: 500 });
    }

    const ids = [
      ...new Set(
        (mcqRows ?? [])
          .map((r) => r.test_series_id as string | null)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    if (ids.length === 0) {
      return Response.json([]);
    }

    const { data: series, error: sErr } = await supabase
      .from("test_series")
      .select("*")
      .in("id", ids)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (sErr) {
      return Response.json({ error: sErr.message }, { status: 500 });
    }

    return Response.json(series ?? []);
  } catch {
    return Response.json(
      { error: "Failed to list MCQ papers" },
      { status: 500 }
    );
  }
}
