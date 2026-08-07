// Read-only workspace summary — the client never reads the workspace cookie
// itself (it's httpOnly on purpose, see lib/workspace.ts); this is how the
// upload card learns whether a workspace already has content after a page
// reload, and what to show in the countdown/summary chip.
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getWorkspaceId, WORKSPACE_TTL_MINUTES } from "@/lib/workspace";
import type { WorkspaceStatus } from "@/lib/types";

const EMPTY: WorkspaceStatus = { workspaceId: null, passageCount: 0, sources: [], expiresAt: null };

export async function GET(req: Request) {
  const workspaceId = getWorkspaceId(req);
  if (!workspaceId) return NextResponse.json(EMPTY);

  const cutoff = new Date(Date.now() - WORKSPACE_TTL_MINUTES * 60_000).toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("passages")
    .select("source_file, origin, created_at")
    .eq("workspace_id", workspaceId)
    .gt("created_at", cutoff);

  if (error) {
    console.error("[/api/workspace/status] unexpected error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  const rows = data ?? [];
  if (rows.length === 0) return NextResponse.json({ ...EMPTY, workspaceId });

  const bySource = new Map<string, { sourceFile: string; origin: WorkspaceStatus["sources"][number]["origin"]; passageCount: number }>();
  let oldest = rows[0].created_at as string;
  for (const row of rows) {
    const key = `${row.source_file}|${row.origin}`;
    const entry = bySource.get(key) ?? { sourceFile: row.source_file, origin: row.origin, passageCount: 0 };
    entry.passageCount += 1;
    bySource.set(key, entry);
    if (row.created_at < oldest) oldest = row.created_at;
  }

  const status: WorkspaceStatus = {
    workspaceId,
    passageCount: rows.length,
    sources: [...bySource.values()],
    expiresAt: new Date(new Date(oldest).getTime() + WORKSPACE_TTL_MINUTES * 60_000).toISOString(),
  };
  return NextResponse.json(status);
}
