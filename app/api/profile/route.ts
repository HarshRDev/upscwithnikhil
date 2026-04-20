import { createClient } from "@supabase/supabase-js";
import {
  bearerTokenFromRequest,
  getUserIdFromRequest,
} from "../../lib/authFromRequest";

function userScopedClient(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

/* =========================
  GET → Current user profile
========================= */
export async function GET(req: Request) {
  const token = bearerTokenFromRequest(req);
  const userId = await getUserIdFromRequest(req);
  if (!token || !userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = userScopedClient(token);
  const { data: authData, error: authError } = await db.auth.getUser(token);
  if (authError || !authData.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await db
    .from("profiles")
    .select("id, name, role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    id: userId,
    email: authData.user.email ?? "",
    name:
      (profile?.name && String(profile.name).trim()) ||
      (typeof authData.user.user_metadata?.name === "string"
        ? authData.user.user_metadata.name
        : "") ||
      "Student",
    role:
      (profile?.role && String(profile.role).trim().toLowerCase()) || "student",
  });
}

/* =========================
  PATCH → Update own name
========================= */
export async function PATCH(req: Request) {
  const token = bearerTokenFromRequest(req);
  const userId = await getUserIdFromRequest(req);
  if (!token || !userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const db = userScopedClient(token);
  const { error } = await db.from("profiles").upsert(
    {
      id: userId,
      name,
    },
    { onConflict: "id" }
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

/* =========================
  DELETE → Delete own account
========================= */
export async function DELETE(req: Request) {
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

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
