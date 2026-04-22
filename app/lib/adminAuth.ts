import { createClient } from "@supabase/supabase-js";
import { bearerTokenFromRequest, getUserIdFromRequest } from "./authFromRequest";

type AdminRole = "admin" | "superadmin";

const ADMIN_ROLES: AdminRole[] = ["admin", "superadmin"];

export async function requireAdminUser(req: Request): Promise<{
  ok: true;
  userId: string;
}> {
  const token = bearerTokenFromRequest(req);
  if (!token) {
    throw new Error("Unauthorized");
  }

  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url) {
    throw new Error("Server config missing NEXT_PUBLIC_SUPABASE_URL");
  }

  // Prefer service role for deterministic role checks even with strict RLS.
  const db = service
    ? createClient(url, service, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : anon
      ? createClient(url, anon, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        })
      : null;

  if (!db) {
    throw new Error("Server config missing Supabase keys");
  }

  const { data: profile, error } = await db
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const role = String(profile?.role ?? "")
    .trim()
    .toLowerCase();
  if (!ADMIN_ROLES.includes(role as AdminRole)) {
    throw new Error("Forbidden");
  }

  return { ok: true, userId };
}

export function adminAccessErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unauthorized";
  if (message === "Forbidden") {
    return Response.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }
  if (message === "Unauthorized") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (message.startsWith("Server config missing")) {
    return Response.json({ error: message }, { status: 503 });
  }
  return Response.json({ error: message }, { status: 500 });
}
