// The full request pipeline: rate limit -> cache -> spend cap -> screen
// -> retrieve -> generate -> ground. Extracted from app/api/ask/route.ts so both
// /api/ask (question/answer contract) and /api/tickets (Provenance ticket
// contract — see lib/tickets.ts) share one implementation instead of two copies of
// the same safety-critical ordering.
//
// Order matters: screening and rate limiting always run before any model call that
// costs real money (non-negotiable #3); the spend cap is charged in two steps so a
// request blocked at screening only ever books the screening call's real cost.
import { retrieve, type WorkspaceScope } from "./retrieve";
import { generateAnswer } from "./generate";
import { groundAnswer, deriveCitations } from "./ground";
import { screenQuestion } from "./screen";
import {
  hashQuestion,
  checkRateLimit,
  getCachedResponse,
  setCachedResponse,
  adjustSpend,
  isSpendCapHit,
  ESTIMATED_COST_SCREEN_USD,
  ESTIMATED_COST_PIPELINE_USD,
} from "./limit";
import { hasWorkspaceContent, WORKSPACE_TTL_MINUTES } from "./workspace";
import type { AskResponse, ScreenResult } from "./types";

function blocked(reason: ScreenResult["reason"], latencyMs = 0): AskResponse {
  return {
    outcome: "blocked",
    answer: null,
    citations: [],
    screening: { passed: false, reason, latencyMs },
    retrieval: { passages: [], k: 0, latencyMs: 0 },
    generation: null,
    grounding: null,
    cached: false,
  };
}

export async function runAskPipeline(
  question: string,
  ipHash: string,
  workspace?: WorkspaceScope,
  trustedGuidedDemo = false
): Promise<AskResponse> {
  // 1. Rate limit — before any model call. The three exact, server-whitelisted
  // guided scenarios are presentation fixtures backed by stable cache entries;
  // do not let repeated demo clicks exhaust the visitor's custom-request quota.
  // Custom tickets and uploaded-document questions always use the real limit.
  const withinLimit = trustedGuidedDemo || await checkRateLimit(ipHash);
  if (!withinLimit) return blocked("rate_limited");

  // 2. Cache — identical questions cost nothing, and this is what keeps the
  //    pre-warmed example questions answerable even when the spend cap is hit.
  //    Only treat this as workspace-scoped if the workspace actually has live
  //    (non-expired) overlay content — a visitor carrying a workspace cookie
  //    whose upload already expired should transparently fall back to the
  //    ordinary shared-corpus cache, not a permanently-empty scoped bucket.
  const workspaceActive = workspace ? await hasWorkspaceContent(workspace.id) : false;
  const cacheKeyPart = workspaceActive ? `ws:${workspace!.id}:${workspace!.includeShared ?? true}:` : undefined;
  const cacheTtlMinutes = workspaceActive ? WORKSPACE_TTL_MINUTES : undefined;
  const questionHash = hashQuestion(question, cacheKeyPart);
  const cached = await getCachedResponse(questionHash, cacheTtlMinutes);
  if (cached) return { ...cached, cached: true };

  // 3. Spend cap, phase 1: charge the screening call's estimated cost up front.
  const totalAfterScreenCharge = await adjustSpend(ESTIMATED_COST_SCREEN_USD);
  if (isSpendCapHit(totalAfterScreenCharge)) {
    await adjustSpend(-ESTIMATED_COST_SCREEN_USD);
    return blocked("budget_exhausted");
  }

  // 4. Screen. workspaceActive widens the classifier's topic scope: with an
  //    uploaded document present, "off_topic" means "no document could answer
  //    this," not "not about coworking" — otherwise every question about the
  //    visitor's own document is blocked and the upload feature is unusable.
  //    The injection rules are identical in both modes.
  const { result: screening, modelCalled } = await screenQuestion(question, workspaceActive);
  if (!screening.passed) {
    if (!modelCalled) await adjustSpend(-ESTIMATED_COST_SCREEN_USD); // deny-list caught it, no call made
    return { ...blocked(screening.reason, screening.latencyMs), screening };
  }

  // 5. Spend cap, phase 2: charge the rest of the pipeline (retrieval is free — gte-
  //    small runs in Supabase's edge runtime at no per-call cost to us — but
  //    generation + decomposition + entailment are three more Haiku calls).
  const totalAfterPipelineCharge = await adjustSpend(ESTIMATED_COST_PIPELINE_USD);
  if (isSpendCapHit(totalAfterPipelineCharge)) {
    await adjustSpend(-ESTIMATED_COST_PIPELINE_USD);
    return { ...blocked("budget_exhausted"), screening };
  }

  // 6. Retrieve.
  const retrieval = await retrieve(question, undefined, workspace);

  // 7. Generate.
  const generation = await generateAnswer(question, retrieval.passages);
  if ("ok" in generation) {
    return {
      outcome: "refused",
      answer: null,
      citations: [],
      screening,
      retrieval,
      generation: null,
      grounding: null,
      cached: false,
    };
  }

  // 8. Ground.
  const grounding = await groundAnswer(generation.answer, retrieval.passages);
  if ("ok" in grounding) {
    return {
      outcome: "refused",
      answer: null,
      citations: [],
      screening,
      retrieval,
      generation: { tokensOut: generation.tokensOut, latencyMs: generation.latencyMs },
      grounding: null,
      cached: false,
    };
  }

  const response: AskResponse = {
    outcome: grounding.passed ? "answered" : "refused",
    answer: grounding.passed ? generation.answer : null,
    citations: grounding.passed ? deriveCitations(grounding) : [],
    screening,
    retrieval,
    generation: { tokensOut: generation.tokensOut, latencyMs: generation.latencyMs },
    grounding,
    cached: false,
  };

  // Cache answered/refused outcomes (stable given the corpus); never cache "blocked"
  // — that reflects transient rate-limit/spend state, not a fact about the question.
  await setCachedResponse(questionHash, response);

  return response;
}
