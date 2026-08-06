// Shared types. This is the contract between the pipeline (lib/, app/api/ask) and the
// UI (app/page.tsx). Do not change AskResponse's shape without updating both sides.

export type Passage = {
  id: string;
  sourceFile: string;
  heading: string | null;
  content: string;
};

export type RetrievedPassage = Passage & { similarity: number };

export type ScreenResult = {
  passed: boolean;
  // "bot_check_failed" is a small amendment on top of the original spec's reason union
  // (see CLAUDE.md) — it lets a Turnstile failure render in the same pipeline panel as
  // every other outcome instead of being a special-cased raw HTTP error.
  reason: "ok" | "injection" | "off_topic" | "rate_limited" | "budget_exhausted" | "bot_check_failed";
  latencyMs: number;
};

export type Claim = {
  text: string;
  supported: boolean;
  supportingPassageIds: string[];
  score: number;
};

export type GroundingResult = {
  score: number; // 0..1, mean of claim scores — this is what's displayed as "Groundedness"
  minClaimScore: number; // 0..1, lowest individual claim score (the silent second gate)
  threshold: number;
  minClaimFloor: number;
  passed: boolean;
  claims: Claim[];
};

export type AskResponse = {
  outcome: "answered" | "refused" | "blocked";
  answer: string | null;
  citations: string[]; // passage IDs
  screening: ScreenResult;
  retrieval: { passages: RetrievedPassage[]; k: number; latencyMs: number };
  generation: { tokensOut: number; latencyMs: number } | null;
  grounding: GroundingResult | null;
  cached: boolean;
};

// --- Internal types not part of the AskResponse contract ---

export type GenerationResult = {
  answer: string;
  citations: string[];
  usedPassageIds: string[];
  tokensOut: number;
  latencyMs: number;
};

export type ModelCallError = {
  ok: false;
  error: string;
  stage: "screen" | "generate" | "ground" | "embed";
};

// --- Meridian Assist ticket layer ---
// This wraps AskResponse in business-facing (ticket/automation) framing — see
// docs/PRODUCT-PLAN.md §11. It does NOT replace AskResponse: the pipeline's decision
// logic (screen -> retrieve -> generate -> ground -> gate) is unchanged and still
// produces AskResponse; these types describe how a ticket presents that result.

export type SupportTicket = {
  id: string;
  channel: "email" | "chat" | "helpdesk";
  customerName: string;
  customerContext?: string;
  message: string;
  receivedAt: string;
  // Cosmetic, simulated fields for the demo — not a real ticket classifier. Set at
  // ticket creation time (guided scenarios hardcode plausible values; free-text
  // tickets get generic defaults). Never presented as measured/ML-derived.
  category: string;
};

// Claim-level verification IS the claim check — same data, ticket-facing name.
export type ClaimCheck = Claim;

export type Citation = {
  documentId: string; // passage id, e.g. "pricing-03"
  documentTitle: string; // derived from sourceFile, e.g. "Pricing"
  section: string | null; // passage heading
  passage: string; // passage content
  documentVersion: string; // corpus version stamp — see lib/tickets.ts CORPUS_VERSION
};

export type AuditEvent = {
  ticketId: string;
  stage: "intake" | "screening" | "retrieval" | "generation" | "verification" | "routing" | "action";
  outcome: string;
  detail: string | null;
  timestamp: string;
};

export type AutomationDecision = {
  ticketId: string;
  outcome: "approved" | "human_review" | "blocked";
  reason: string;
  proposedResponse: string | null;
  citations: Citation[];
  claimChecks: ClaimCheck[];
  groundedness: number | null;
  auditEvents: AuditEvent[];
  // Extensions beyond the plan's minimal external contract — the ticket UI needs the
  // full pipeline detail (retrieval similarity, per-stage timing) to render the
  // evidence panel; the underlying AskResponse carries that.
  ticket: SupportTicket;
  askResponse: AskResponse;
};

export type ReviewHandoff = {
  ticketId: string;
  queue: "operations" | "billing" | "security";
  summary: string;
  reason: string;
  citations: Citation[];
  priority: "normal" | "high";
};
