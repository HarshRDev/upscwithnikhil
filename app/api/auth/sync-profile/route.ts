import { createClient } from "@supabase/supabase-js";
import { getUserIdFromRequest } from "../../../lib/authFromRequest";

/* =========================
   POST → Ensure public.profiles row exists for the signed-in user
   Uses service role so it works even when RLS blocks direct client inserts.
========================= */
export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !service) {
      return Response.json(
        { error: "Server missing SUPABASE_SERVICE_ROLE_KEY" },
        { status: 503 }
      );
    }

    let name = "";
    try {
      const body = await req.json();
      if (typeof body?.name === "string") name = body.name.trim();
    } catch {
      /* optional body */
    }

    const admin = createClient(url, service, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: existing } = await admin
      .from("profiles")
      .select("id, name")
      .eq("id", userId)
      .maybeSingle();

    const displayName =
      name ||
      (existing?.name && String(existing.name).trim()) ||
      "Student";

    const { error } = await admin.from("profiles").upsert(
      {
        id: userId,
        name: displayName,
        role: "student",
      },
      { onConflict: "id" }
    );

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
