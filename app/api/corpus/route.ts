// Serves corpus passages for inspection — lets a reviewer verify a refusal was
// correct by reading the actual source docs, not just trusting the model.
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const sourceFile = searchParams.get("sourceFile");

  try {
    let query = getSupabaseAdmin()
      .from("passages")
      .select("id, source_file, heading, content, token_count")
      .order("id");

    if (id) query = query.eq("id", id);
    if (sourceFile) query = query.eq("source_file", sourceFile);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json({ passages: data ?? [] });
  } catch (err) {
    console.error("[/api/corpus] unexpected error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
