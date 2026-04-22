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
   GET → Fetch all courses
========================= */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("courses")
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
   POST → Create new course
========================= */
export async function POST(req: Request) {
  try {
    await requireAdminUser(req);
    const db = supabaseForAdminWrite(req);
    if (!db) return adminWriteUnauthorizedResponse();

    const body = await req.json();

    const { title, description, price, is_published } = body;

    // basic validation
    if (!title || !description || !price) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await db
      .from("courses")
      .insert([
        {
          title,
          description,
          price,
          is_published: is_published ?? true,
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