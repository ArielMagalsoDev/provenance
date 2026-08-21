// Maps a SupportTicket through the existing pipeline (lib/pipeline.ts — unchanged
// decision logic) and wraps the result as an AutomationDecision, with a real,
// persisted audit trail. See docs/PRODUCT-PLAN.md §11: this is presentation and
// persistence on top of the verified pipeline, not a new decision core.
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { runAskPipeline } from "./pipeline";
import { postTicketNotification } from "./slack";
import type { WorkspaceScope } from "./retrieve";
import type {
  AskResponse,
  AutomationDecision,
  AuditEvent,
  Citation,
  PassageOrigin,
  SupportTicket,
  ReviewHandoff,
  RetrievedPassage,
} from "./types";

// Bumped manually when /corpus content changes and ingest is re-run — the "cheapest
// honest implementation" of document versioning noted in docs/PRODUCT-PLAN.md §11.
// Full per-document version history is out of scope for this demo.
export const CORPUS_VERSION = "v1-2026-08-06";

// Provenance is this demo's whole thesis, so a citation's title has to say
// where content actually came from, not just derive a pretty label from a
// corpus filename that doesn't exist for the other two origins.
function documentTitleFromPassage(sourceFile: string, origin: PassageOrigin): string {
  if (origin === "learned") return "Operator approved";
  if (origin === "uploaded") return sourceFile; // the visitor's own filename, shown as-is
  return sourceFile
    .replace(/\.md$/, "")
    .split("-")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function outcomeToDecision(outcome: AskResponse["outcome"]): AutomationDecision["outcome"] {
  if (outcome === "answered") return "approved";
  if (outcome === "refused") return "human_review";
  return "blocked";
}

const SCREENING_BLOCK_REASONS: Record<string, string> = {
  injection: "The request attempted to override system instructions or extract protected information.",
  off_topic: "The request is unrelated to Meridian Nine's policies.",
  rate_limited: "Rate limit exceeded for this session.",
  budget_exhausted: "Daily automation budget reached; routed to the cached fallback or blocked entirely.",
  bot_check_failed: "Automated request pattern detected at the bot-check stage.",
};

function deriveReason(response: AskResponse): string {
  if (response.outcome === "blocked") {
    return SCREENING_BLOCK_REASONS[response.screening.reason] ?? "Blocked before retrieval or generation.";
  }

  if (response.outcome === "refused") {
    if (!response.grounding) return "Response generation failed; routed to review as a safety default.";
    if (response.grounding.claims.length === 0) {
      return "The retrieved passages do not establish an answer; no verifiable claim could be grounded.";
    }
    const weakest = [...response.grounding.claims].sort((a, b) => a.score - b.score)[0];
    return (
      `Evidence is insufficient for an automatic response. Weakest claim scored ` +
      `${weakest.score.toFixed(2)} — below the ${response.grounding.minClaimFloor.toFixed(2)} per-claim floor ` +
      `or the ${response.grounding.threshold.toFixed(2)} mean threshold: "${weakest.text}"`
    );
  }

  // answered
  const threshold = response.grounding?.threshold ?? 0.7;
  return `Policy directly supports the answer; every material claim verified at or above the ${threshold.toFixed(2)} groundedness threshold.`;
}

function toCitations(response: AskResponse): Citation[] {
  const passageById = new Map(response.retrieval.passages.map((p) => [p.id, p]));
  return response.citations
    .map((id) => passageById.get(id))
    .filter((p): p is RetrievedPassage => Boolean(p))
    .map((p) => ({
      documentId: p.id,
      documentTitle: documentTitleFromPassage(p.sourceFile, p.origin),
      section: p.heading,
      passage: p.content,
      // Corpus version stamp only means something for the shared corpus —
      // overlay content is session-scoped, not versioned document history.
      documentVersion: p.origin === "corpus" ? CORPUS_VERSION : "session overlay",
      origin: p.origin,
    }));
}

function synthesizeAuditEvents(
  ticketId: string,
  response: AskResponse,
  decisionOutcome: AutomationDecision["outcome"],
  reason: string
): AuditEvent[] {
  // Stamped close together rather than reconstructed from per-stage server clocks —
  // these mark when the ticket was PROCESSED (audit-record time), not exact stage
  // wall-clock boundaries (those live in askResponse's own latencyMs fields).
  const now = new Date().toISOString();
  const events: AuditEvent[] = [
    { ticketId, stage: "intake", outcome: "received", detail: null, timestamp: now },
    {
      ticketId,
      stage: "screening",
      outcome: response.screening.reason,
      detail: `${response.screening.passed ? "passed" : "blocked"} in ${response.screening.latencyMs}ms`,
      timestamp: now,
    },
  ];

  if (response.retrieval.passages.length > 0) {
    events.push({
      ticketId,
      stage: "retrieval",
      outcome: `${response.retrieval.passages.length} passages`,
      detail: response.retrieval.passages.map((p) => `${p.id}(${p.similarity.toFixed(2)})`).join(", "),
      timestamp: now,
    });
  }

  if (response.generation) {
    events.push({
      ticketId,
      stage: "generation",
      outcome: "done",
      detail: `${response.generation.tokensOut} tokens in ${response.generation.latencyMs}ms`,
      timestamp: now,
    });
  }

  if (response.grounding) {
    events.push({
      ticketId,
      stage: "verification",
      outcome: response.grounding.passed ? "sufficient" : "insufficient",
      detail: `score ${response.grounding.score.toFixed(2)} (min claim ${response.grounding.minClaimScore.toFixed(2)}) vs threshold ${response.grounding.threshold.toFixed(2)}`,
      timestamp: now,
    });
  }

  events.push({ ticketId, stage: "routing", outcome: decisionOutcome, detail: reason, timestamp: now });

  return events;
}

async function persistAuditEvents(events: AuditEvent[]): Promise<void> {
  const rows = events.map((e) => ({
    ticket_id: e.ticketId,
    stage: e.stage,
    outcome: e.outcome,
    detail: e.detail,
    created_at: e.timestamp,
  }));
  const { error } = await getSupabaseAdmin().from("audit_events").insert(rows);
  if (error) throw new Error(`persistAuditEvents failed: ${error.message}`);
}

export type TicketInput = Omit<SupportTicket, "id" | "receivedAt">;

/** Real, persisted ticket row — status "open" is what the Agent Inbox queue
 *  reads from. workspaceId scopes the row to one visitor's session the same
 *  way it scopes passages; null means a shared-demo ticket (guided scenarios,
 *  anonymous free-text with no workspace yet). */
async function persistTicket(fullTicket: SupportTicket, workspaceId: string | null, decision: AutomationDecision): Promise<void> {
  const { error } = await getSupabaseAdmin().from("tickets").insert({
    id: fullTicket.id,
    workspace_id: workspaceId,
    channel: fullTicket.channel,
    customer_name: fullTicket.customerName,
    customer_context: fullTicket.customerContext ?? null,
    category: fullTicket.category,
    message: fullTicket.message,
    outcome: decision.outcome,
    reason: decision.reason,
    proposed_response: decision.proposedResponse,
    citations: decision.citations,
    groundedness: decision.groundedness,
    status: decision.outcome === "human_review" ? "open" : "resolved",
    ask_response: decision.askResponse, // full pipeline detail — see the tickets_ask_response migration
    created_at: fullTicket.receivedAt,
  });
  if (error) throw new Error(`persistTicket failed: ${error.message}`);
}

/** Posts the ticket to Slack (if configured), stores which message it became
 *  so it can be updated in place on resolution, and records a real
 *  "notification" audit event — appended directly onto `decision` (not just
 *  persisted) so the response the caller already has in hand reflects it
 *  immediately, matching non-negotiable #1's "nothing hidden" without
 *  needing a second round-trip. Entirely best-effort: postTicketNotification
 *  itself never throws (see lib/slack.ts), and every failure here is caught
 *  so a Slack/DB hiccup can never fail an already-decided, already-persisted
 *  ticket. */
async function notifySlack(decision: AutomationDecision): Promise<void> {
  try {
    const posted = await postTicketNotification(decision);
    if (!posted) return;

    const { error } = await getSupabaseAdmin()
      .from("tickets")
      .update({ slack_channel: posted.channel, slack_ts: posted.ts })
      .eq("id", decision.ticketId);
    if (error) throw new Error(`notifySlack: storing slack_channel/ts failed: ${error.message}`);

    const event: AuditEvent = {
      ticketId: decision.ticketId,
      stage: "notification",
      outcome: "posted",
      detail: `Posted to Slack (channel ${posted.channel}).`,
      timestamp: new Date().toISOString(),
    };
    await persistAuditEvents([event]);
    decision.auditEvents.push(event);
  } catch (err) {
    console.error("[lib/tickets] notifySlack failed (non-fatal, ticket already decided/persisted):", err);
  }
}

export async function runTicket(
  ticket: TicketInput,
  ipHash: string,
  workspace?: WorkspaceScope,
  trustedGuidedDemo = false
): Promise<AutomationDecision> {
  const fullTicket: SupportTicket = {
    ...ticket,
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
  };

  const askResponse = await runAskPipeline(ticket.message, ipHash, workspace, trustedGuidedDemo);
  const outcome = outcomeToDecision(askResponse.outcome);
  const reason = deriveReason(askResponse);
  const auditEvents = synthesizeAuditEvents(fullTicket.id, askResponse, outcome, reason);

  const decision: AutomationDecision = {
    ticketId: fullTicket.id,
    outcome,
    reason,
    proposedResponse: askResponse.answer,
    citations: toCitations(askResponse),
    claimChecks: askResponse.grounding?.claims ?? [],
    groundedness: askResponse.grounding?.score ?? null,
    auditEvents,
    ticket: fullTicket,
    askResponse,
  };

  await Promise.all([persistAuditEvents(auditEvents), persistTicket(fullTicket, workspace?.id ?? null, decision)]);
  await notifySlack(decision); // fire-and-forget internally; mutates decision.auditEvents on success — see notifySlack

  return decision;
}

export function toReviewHandoff(decision: AutomationDecision): ReviewHandoff | null {
  if (decision.outcome !== "human_review") return null;
  const priority = (decision.groundedness ?? 1) < 0.3 ? "high" : "normal";
  return {
    ticketId: decision.ticketId,
    queue: "operations",
    summary: decision.ticket.message,
    reason: decision.reason,
    citations: decision.citations,
    priority,
  };
}

/** Logs a simulated downstream action (send/escalate) as its own audit event. This
 * specific action — replying to the customer — stays simulated even now that a real
 * connector exists (see lib/slack.ts / docs/PLAN-slack-integration.md for the
 * operator-notification side): no email or real ticketing system is touched, so this
 * only ever records that the demo user clicked the button. */
export async function recordSimulatedAction(ticketId: string, action: "sent" | "escalated"): Promise<AuditEvent> {
  const event: AuditEvent = {
    ticketId,
    stage: "action",
    outcome: action === "sent" ? "simulated_send" : "simulated_escalation",
    detail:
      action === "sent"
        ? "Reply marked as sent (simulated — no real messaging integration configured)."
        : "Escalated to the Operations queue (simulated — no real ticketing integration configured).",
    timestamp: new Date().toISOString(),
  };
  await persistAuditEvents([event]);
  return event;
}
