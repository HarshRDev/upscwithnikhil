import { createClient } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabaseClient";
import {
  adminAccessErrorResponse,
  requireAdminUser,
} from "../../../lib/adminAuth";

type ListedStudent = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

/* =========================
   GET → List students (auth users) or profiles fallback
   Prefer SUPABASE_SERVICE_ROLE_KEY so emails appear in the admin table.
========================= */
export async function GET(req: Request) {
  try {
    await requireAdminUser(req);
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("id");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceKey && url) {
      const admin = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data, error } = await admin.auth.admin.listUsers({
        perPage: 1000,
        page: 1,
      });

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      let users = data.users.map((u) => ({
        id: u.id,
        email: u.email ?? "—",
        name:
          (u.user_metadata?.name as string) ||
          (u.user_metadata?.full_name as string) ||
          "—",
        created_at: u.created_at,
      }));

      if (studentId) {
        users = users.filter((u) => u.id === studentId);
      }

      return Response.json(users);
    }

    let query = supabase
      .from("profiles")
      .select("id, name, created_at, role")
      .order("created_at", { ascending: false });

    if (studentId) {
      query = query.eq("id", studentId);
    }

    const { data, error } = await query;

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const fallback: ListedStudent[] = (data ?? []).map((p) => ({
      id: p.id,
      name: p.name ?? "—",
      email: "—",
      created_at: p.created_at,
    }));

    return Response.json(fallback);
  } catch (error) {
    return adminAccessErrorResponse(error);
  }
}
