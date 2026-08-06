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
