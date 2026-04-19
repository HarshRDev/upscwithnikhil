import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { bearerTokenFromRequest } from "./authFromRequest";

/**
 * Inserts/updates from API routes must not use the bare anon client when RLS is on.
 * Prefer SUPABASE_SERVICE_ROLE_KEY for admin panel writes; otherwise use the caller's JWT.
 */
export function supabaseForAdminWrite(req: Request): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !anon) return null;

  if (service && service.length > 0) {
    return createClient(url, service, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  const token = bearerTokenFromRequest(req);
  if (!token) return null;

  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export function adminWriteUnauthorizedResponse() {
  return Response.json(
    {
      error:
        "Admin write blocked: set SUPABASE_SERVICE_ROLE_KEY in .env.local (Supabase → Settings → API → service_role), then Save the file (Ctrl+S) and restart npm run dev. Unsaved editor-only lines are ignored. Or sign in on this site so your session JWT is sent.",
    },
    { status: 401 }
  );
}
