import { supabase } from "../../lib/supabaseClient";

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
    const body = await req.json();

    const { title, description, price, is_published } = body;

    // basic validation
    if (!title || !description || !price) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
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
    return Response.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}