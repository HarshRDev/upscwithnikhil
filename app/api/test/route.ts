import { supabase } from "../../lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from("articles")
    .select("*");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}