// Maps a SupportTicket through the existing pipeline (lib/pipeline.ts — unchanged
// decision logic) and wraps the result as an AutomationDecision, with a real,
// persisted audit trail. See docs/PRODUCT-PLAN.md §11: this is presentation and
// persistence on top of the verified pipeline, not a new decision core.
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { runAskPipeline } from "./pipeline";
import type {
  AskResponse,
  AutomationDecision,
  AuditEvent,
  Citation,
  SupportTicket,
  ReviewHandoff,
  RetrievedPassage,
} from "./types";

// Bumped manually when /corpus content changes and ingest is re-run — the "cheapest
// honest implementation" of document versioning noted in docs/PRODUCT-PLAN.md §11.
// Full per-document version history is out of scope for this demo.
export const CORPUS_VERSION = "v1-2026-08-06";

function documentTitleFromSourceFile(sourceFile: string): string {
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
      documentTitle: documentTitleFromSourceFile(p.sourceFile),
      section: p.heading,
      passage: p.content,
      documentVersion: CORPUS_VERSION,
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

export async function runTicket(
  ticket: TicketInput,
  ipHash: string,
  turnstileToken: string,
  clientIp: string
): Promise<AutomationDecision> {
  const fullTicket: SupportTicket = {
    ...ticket,
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
  };

  const askResponse = await runAskPipeline(ticket.message, ipHash, turnstileToken, clientIp);
  const outcome = outcomeToDecision(askResponse.outcome);
  const reason = deriveReason(askResponse);
  const auditEvents = synthesizeAuditEvents(fullTicket.id, askResponse, outcome, reason);

  await persistAuditEvents(auditEvents);

  return {
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

/** Logs a simulated downstream action (send/escalate) as its own audit event. No real
 * integration exists yet — see docs/PRODUCT-PLAN.md Phase 4 — so this only ever
 * records that the demo user clicked the button, never actually sends or escalates
 * anything externally. */
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
