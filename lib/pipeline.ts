// The full request pipeline: bot check -> rate limit -> cache -> spend cap -> screen
// -> retrieve -> generate -> ground. Extracted from app/api/ask/route.ts so both
// /api/ask (question/answer contract) and /api/tickets (Meridian Assist ticket
// contract — see lib/tickets.ts) share one implementation instead of two copies of
// the same safety-critical ordering.
//
// Order matters: screening and rate limiting always run before any model call that
// costs real money (non-negotiable #3); the spend cap is charged in two steps so a
// request blocked at screening only ever books the screening call's real cost.
import { retrieve } from "./retrieve";
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
  verifyTurnstile,
  ESTIMATED_COST_SCREEN_USD,
  ESTIMATED_COST_PIPELINE_USD,
} from "./limit";
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
  turnstileToken: string,
  clientIp: string
): Promise<AskResponse> {
  const questionHash = hashQuestion(question);

  // 1. Bot check — before anything else touches the DB or a model.
  const turnstileOk = await verifyTurnstile(turnstileToken, clientIp);
  if (!turnstileOk) return blocked("bot_check_failed");

  // 2. Rate limit — before any model call.
  const withinLimit = await checkRateLimit(ipHash);
  if (!withinLimit) return blocked("rate_limited");

  // 3. Cache — identical questions cost nothing, and this is what keeps the
  //    pre-warmed example questions answerable even when the spend cap is hit.
  const cached = await getCachedResponse(questionHash);
  if (cached) return { ...cached, cached: true };

  // 4. Spend cap, phase 1: charge the screening call's estimated cost up front.
  const totalAfterScreenCharge = await adjustSpend(ESTIMATED_COST_SCREEN_USD);
  if (isSpendCapHit(totalAfterScreenCharge)) {
    await adjustSpend(-ESTIMATED_COST_SCREEN_USD);
    return blocked("budget_exhausted");
  }

  // 5. Screen.
  const { result: screening, modelCalled } = await screenQuestion(question);
  if (!screening.passed) {
    if (!modelCalled) await adjustSpend(-ESTIMATED_COST_SCREEN_USD); // deny-list caught it, no call made
    return { ...blocked(screening.reason, screening.latencyMs), screening };
  }

  // 6. Spend cap, phase 2: charge the rest of the pipeline (retrieval is free — gte-
  //    small runs in Supabase's edge runtime at no per-call cost to us — but
  //    generation + decomposition + entailment are three more Haiku calls).
  const totalAfterPipelineCharge = await adjustSpend(ESTIMATED_COST_PIPELINE_USD);
  if (isSpendCapHit(totalAfterPipelineCharge)) {
    await adjustSpend(-ESTIMATED_COST_PIPELINE_USD);
    return { ...blocked("budget_exhausted"), screening };
  }

  // 7. Retrieve.
  const retrieval = await retrieve(question);

  // 8. Generate.
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

  // 9. Ground.
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
