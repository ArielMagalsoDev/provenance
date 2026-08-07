// "Remove my document" — deletes the caller's overlay passages and any
// cached responses that might cite them, rather than waiting out the
// WORKSPACE_TTL_MINUTES expiry.
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getWorkspaceId } from "@/lib/workspace";

export async function POST(req: Request) {
  const workspaceId = getWorkspaceId(req);
  if (!workspaceId) return NextResponse.json({ cleared: 0 });

  try {
    const { error, count } = await getSupabaseAdmin()
      .from("passages")
      .delete({ count: "exact" })
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`clear failed: ${error.message}`);
    return NextResponse.json({ cleared: count ?? 0 });
  } catch (err) {
    console.error("[/api/workspace/clear] unexpected error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
