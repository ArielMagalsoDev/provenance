// Agent Inbox: list escalated (human_review) tickets and let an operator edit
// + approve a response. Approval embeds the correction into the caller's
// workspace overlay as a "learned" passage and invalidates the stale cached
// refusal for that exact question — see docs/PLAN-hitl-and-workspaces.md and
// the response-cache-never-auto-invalidates gotcha (HANDOFF.md #8).
import { getSupabaseAdmin } from "./supabaseAdmin";
import { embedTexts } from "./embed";
import { hashQuestion, deleteCachedResponse } from "./limit";
import { matchesDenyList } from "./screen";
import type { AskResponse, AuditEvent, Citation } from "./types";

const MAX_OVERLAY_PASSAGES = 40;
const INBOX_LIMIT = 25;

export type InboxTicketRow = {
  id: string;
  channel: string;
  customerName: string;
  customerContext: string | null;
  category: string;
  message: string;
  outcome: string;
  reason: string;
  proposedResponse: string | null;
  citations: Citation[];
  groundedness: number | null;
  status: "open" | "resolved";
  resolution: { action: "approved" | "dismissed"; editedResponse?: string; resolvedAt: string } | null;
  askResponse: AskResponse | null; // full pipeline detail — same shape /demo renders
  createdAt: string;
};

type TicketDbRow = {
  id: string;
  workspace_id: string | null;
  channel: string;
  customer_name: string;
  customer_context: string | null;
  category: string;
  message: string;
  outcome: string;
  reason: string;
  proposed_response: string | null;
  citations: Citation[];
  groundedness: number | null;
  status: "open" | "resolved";
  resolution: InboxTicketRow["resolution"];
  ask_response: AskResponse | null;
  created_at: string;
};

function rowToTicket(row: TicketDbRow): InboxTicketRow {
  return {
    id: row.id,
    channel: row.channel,
    customerName: row.customer_name,
    customerContext: row.customer_context,
    category: row.category,
    message: row.message,
    outcome: row.outcome,
    reason: row.reason,
    proposedResponse: row.proposed_response,
    citations: row.citations ?? [],
    groundedness: row.groundedness,
    status: row.status,
    resolution: row.resolution,
    askResponse: row.ask_response,
    createdAt: row.created_at,
  };
}

/** Shared-demo tickets (workspace_id null) plus the caller's own workspace
 *  tickets, if any — same visibility rule as passages. Applies the shared
 *  workspace-or-null filter to whatever select() the caller already chose
 *  (list needs "*", count needs a head-only count query) — the query builder
 *  is "thenable" so it must stay un-awaited until the final chain link, or
 *  awaiting it early resolves it into a plain response with no more query
 *  methods on it. */
function scopeToWorkspace<T extends { or: (s: string) => T; is: (c: string, v: null) => T }>(query: T, workspaceId: string | null): T {
  // workspaceId is only ever a value that already passed lib/workspace.ts's
  // strict UUID regex, so interpolating it into the PostgREST filter string
  // below carries no injection surface.
  return workspaceId ? query.or(`workspace_id.is.null,workspace_id.eq.${workspaceId}`) : query.is("workspace_id", null);
}

export async function listOpenTickets(workspaceId: string | null): Promise<InboxTicketRow[]> {
  const base = getSupabaseAdmin().from("tickets").select("*").eq("status", "open").order("created_at", { ascending: false });
  const { data, error } = await scopeToWorkspace(base, workspaceId).limit(INBOX_LIMIT);
  if (error) throw new Error(`listOpenTickets failed: ${error.message}`);
  return ((data as TicketDbRow[]) ?? []).map(rowToTicket);
}

export async function countOpenTickets(workspaceId: string | null): Promise<number> {
  const base = getSupabaseAdmin().from("tickets").select("id", { count: "exact", head: true }).eq("status", "open");
  const { count, error } = await scopeToWorkspace(base, workspaceId);
  if (error) throw new Error(`countOpenTickets failed: ${error.message}`);
  return count ?? 0;
}

async function persistActionEvent(ticketId: string, outcome: string, detail: string): Promise<void> {
  const event: AuditEvent = { ticketId, stage: "action", outcome, detail, timestamp: new Date().toISOString() };
  const { error } = await getSupabaseAdmin()
    .from("audit_events")
    .insert({ ticket_id: event.ticketId, stage: event.stage, outcome: event.outcome, detail: event.detail, created_at: event.timestamp });
  if (error) throw new Error(`persistActionEvent failed: ${error.message}`);
}

export type ResolveResult =
  | { ok: true; ticket: InboxTicketRow }
  | { ok: false; error: "not_found" | "already_resolved" | "denylist_blocked" | "workspace_full" | "empty_response" };

export async function resolveTicket(
  ticketId: string,
  action: "approve" | "dismiss",
  editedResponse: string | undefined,
  workspaceId: string
): Promise<ResolveResult> {
  const supabase = getSupabaseAdmin();
  const { data, error: fetchErr } = await supabase.from("tickets").select("*").eq("id", ticketId).maybeSingle();
  if (fetchErr) throw new Error(`resolveTicket fetch failed: ${fetchErr.message}`);
  const row = data as TicketDbRow | null;
  if (!row) return { ok: false, error: "not_found" };
  if (row.status !== "open") return { ok: false, error: "already_resolved" };

  const now = new Date().toISOString();

  if (action === "dismiss") {
    const resolution = { action: "dismissed" as const, resolvedAt: now };
    const { error } = await supabase.from("tickets").update({ status: "resolved", resolution }).eq("id", ticketId);
    if (error) throw new Error(`resolveTicket dismiss failed: ${error.message}`);
    await persistActionEvent(ticketId, "dismissed", "Operator dismissed without teaching a correction.");
    return { ok: true, ticket: rowToTicket({ ...row, status: "resolved", resolution }) };
  }

  // approve
  const answer = (editedResponse ?? "").trim();
  if (!answer) return { ok: false, error: "empty_response" };
  if (matchesDenyList(answer)) return { ok: false, error: "denylist_blocked" };

  const { count, error: countErr } = await supabase
    .from("passages")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);
  if (countErr) throw new Error(`resolveTicket count failed: ${countErr.message}`);
  if ((count ?? 0) >= MAX_OVERLAY_PASSAGES) return { ok: false, error: "workspace_full" };

  const [embedding] = await embedTexts([answer]);
  const passageId = `learned-${ticketId.slice(0, 8)}`;
  const content = `Q: ${row.message}\nA (operator-approved): ${answer}`;

  const { error: upsertErr } = await supabase.from("passages").upsert(
    {
      id: passageId,
      source_file: "Operator approved",
      heading: row.message,
      content,
      token_count: Math.ceil(content.length / 4),
      embedding,
      workspace_id: workspaceId,
      origin: "learned",
    },
    { onConflict: "id" }
  );
  if (upsertErr) throw new Error(`resolveTicket upsert failed: ${upsertErr.message}`);

  // Invalidate every cache hash this exact question could plausibly be
  // sitting under right now, so the replay in the UI answers immediately
  // instead of serving the stale refusal for up to 24h.
  await Promise.all([
    deleteCachedResponse(hashQuestion(row.message, `ws:${workspaceId}:true:`)),
    deleteCachedResponse(hashQuestion(row.message)),
  ]);

  const resolution = { action: "approved" as const, editedResponse: answer, resolvedAt: now };
  const { error: updateErr } = await supabase.from("tickets").update({ status: "resolved", resolution }).eq("id", ticketId);
  if (updateErr) throw new Error(`resolveTicket update failed: ${updateErr.message}`);

  await persistActionEvent(ticketId, "operator_approved", `Correction embedded as ${passageId}; response cache invalidated for this question.`);

  return { ok: true, ticket: rowToTicket({ ...row, status: "resolved", resolution }) };
}
