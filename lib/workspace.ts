// Session-scoped "workspace" — an anonymous per-visitor overlay on the shared
// corpus (see docs/PLAN-hitl-and-workspaces.md). Deliberately identified by a
// random cookie, never by IP: real IPs are shared constantly (office/café
// WiFi, mobile carrier CGNAT), so keying content visibility off IP could let
// one visitor see another's upload. IP hash (lib/limit.ts) stays scoped to
// abuse-rate-limiting only.
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const WORKSPACE_COOKIE = "mn_workspace";

// How long overlay content (uploaded docs, learned corrections) stays
// retrievable — enforced in the match_passages query itself (see the
// workspace_overlay migration), not by a cleanup job, so expiry is exact.
export const WORKSPACE_TTL_MINUTES = Number(process.env.WORKSPACE_TTL_MINUTES ?? 30);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseCookieHeader(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      const value = part.slice(eq + 1).trim();
      return UUID_RE.test(value) ? value : null; // never trust an unvalidated cookie value as a DB key
    }
  }
  return null;
}

/** Read-only: does this request already carry a workspace? Never mints one. */
export function getWorkspaceId(req: Request): string | null {
  return parseCookieHeader(req.headers.get("cookie") ?? "", WORKSPACE_COOKIE);
}

/** For write paths (approve, upload) that mint a workspace on first use. */
export function ensureWorkspaceId(req: Request): { id: string; isNew: boolean } {
  const existing = getWorkspaceId(req);
  if (existing) return { id: existing, isNew: false };
  return { id: randomUUID(), isNew: true };
}

/** Attaches the workspace cookie to a response when a new workspace was minted.
 *  httpOnly + not readable by client JS on purpose — the client learns
 *  workspace state (passage count, expiresAt) from API response bodies, never
 *  by reading the cookie. The cookie itself can outlive any single upload;
 *  content expiry is enforced separately via WORKSPACE_TTL_MINUTES. */
export function withWorkspaceCookie(res: NextResponse, workspaceId: string): NextResponse {
  res.cookies.set(WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}

export function workspaceExpiresAt(from: Date = new Date()): string {
  return new Date(from.getTime() + WORKSPACE_TTL_MINUTES * 60_000).toISOString();
}

/** Cheap existence check used to decide whether a cache lookup needs to be
 *  workspace-scoped at all — a visitor with a workspace cookie but no
 *  (or expired) overlay content should hit the ordinary shared cache, not a
 *  permanently-empty workspace-scoped bucket. Import lazily to avoid a
 *  circular import with lib/supabaseAdmin at module-eval time. */
export async function hasWorkspaceContent(workspaceId: string): Promise<boolean> {
  const { getSupabaseAdmin } = await import("./supabaseAdmin");
  const { data, error } = await getSupabaseAdmin()
    .from("passages")
    .select("id")
    .eq("workspace_id", workspaceId)
    .gt("created_at", new Date(Date.now() - WORKSPACE_TTL_MINUTES * 60_000).toISOString())
    .limit(1);
  if (error) throw new Error(`hasWorkspaceContent failed: ${error.message}`);
  return (data?.length ?? 0) > 0;
}
