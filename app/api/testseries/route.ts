import { supabase } from "../../lib/supabaseClient";
import {
  adminWriteUnauthorizedResponse,
  supabaseForAdminWrite,
} from "../../lib/supabaseServiceAdmin";
import {
  adminAccessErrorResponse,
  requireAdminUser,
} from "../../lib/adminAuth";

/* =========================
   GET → Fetch all test series
========================= */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("test_series")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
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
   POST → Create new test series
========================= */
export async function POST(req: Request) {
  try {
    await requireAdminUser(req);
    const db = supabaseForAdminWrite(req);
    if (!db) return adminWriteUnauthorizedResponse();

    const body = await req.json();

    const { title, description, price, total_tests, duration } = body;

    // basic validation
    if (!title || !description || !price || !total_tests) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await db
      .from("test_series")
      .insert([
        {
          title,
          description,
          price,
          total_tests,
          duration: duration || null,
          is_published: true,
        },
      ])
      .select();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json(data);
  } catch (err) {
    if (err instanceof Error && (err.message === "Unauthorized" || err.message === "Forbidden" || err.message.startsWith("Server config missing"))) {
      return adminAccessErrorResponse(err);
    }
    return Response.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
