// Approve/dismiss an escalated ticket. Approve is the one write path that
// mints a workspace cookie if the caller doesn't have one yet (see
// lib/workspace.ts) — the correction has to land somewhere, and it must never
// be the shared corpus (see docs/PLAN-hitl-and-workspaces.md's isolation
// design). No Turnstile/rate-limit here: no model *generation* call happens
// on this path (embedding is free), but it's still capped by
// MAX_OVERLAY_PASSAGES per workspace inside lib/inbox.ts.
import { NextResponse } from "next/server";
import { resolveTicket } from "@/lib/inbox";
import { ensureWorkspaceId, withWorkspaceCookie } from "@/lib/workspace";

const RESOLVE_ERROR_MESSAGES: Record<string, string> = {
  not_found: "Ticket not found — it may already be resolved elsewhere.",
  already_resolved: "This ticket was already resolved.",
  denylist_blocked: "That response contains phrasing that can't be taught to the assistant.",
  workspace_full: "Your workspace has reached its 40-passage limit for this demo.",
  empty_response: "Write a response before approving.",
};

export async function POST(req: Request) {
  let body: { ticketId?: unknown; action?: unknown; editedResponse?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const ticketId = typeof body.ticketId === "string" ? body.ticketId : "";
  const action = body.action === "approve" || body.action === "dismiss" ? body.action : null;
  const editedResponse = typeof body.editedResponse === "string" ? body.editedResponse.slice(0, 2000) : undefined;

  if (!ticketId || !action) {
    return NextResponse.json({ error: "ticketId and a valid action are required" }, { status: 400 });
  }

  const { id: workspaceId, isNew } = ensureWorkspaceId(req);

  try {
    const result = await resolveTicket(ticketId, action, editedResponse, workspaceId);
    if (!result.ok) {
      const status = result.error === "not_found" ? 404 : 409;
      return NextResponse.json({ error: result.error, message: RESOLVE_ERROR_MESSAGES[result.error] }, { status });
    }

    const res = NextResponse.json({ ticket: result.ticket });
    return isNew ? withWorkspaceCookie(res, workspaceId) : res;
  } catch (err) {
    console.error("[/api/inbox/resolve] unexpected error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
