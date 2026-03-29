import { supabase } from "../../lib/supabaseClient";

// GET → fetch articles
export async function GET() {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

// POST → create article
export async function POST(req: Request) {
  const body = await req.json();

  const { title, content } = body;

  const { data, error } = await supabase
    .from("articles")
    .insert([
      {
        title,
        content,
        is_published: true
      }
    ])
    .select();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}