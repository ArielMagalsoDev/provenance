// Pre-warms the response cache for the three Meridian Assist guided scenarios
// (lib/scenarios.ts) by running them through the real pipeline once. This is what
// makes the budget-exhausted fallback in lib/limit.ts actually work: /api/tickets and
// /api/ask both check the cache BEFORE the spend cap, so once these are cached, the
// guided scenarios keep working even at $0 remaining daily budget — everything else
// returns reason: "budget_exhausted". Run this once after `npm run ingest`, and again
// any time the guided scenarios or the corpus change.
//
// Deliberately bypasses runAskPipeline's Turnstile/rate-limit/spend-cap wrapping —
// same rationale as evals/run.ts (see CLAUDE.md Phase 6): this is a maintenance
// script, not a simulated end user, and shouldn't trip its own rate limiter or
// require a real bot-check token.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { screenQuestion } from "../lib/screen";
import { retrieve } from "../lib/retrieve";
import { generateAnswer } from "../lib/generate";
import { groundAnswer, deriveCitations } from "../lib/ground";
import { hashQuestion, setCachedResponse } from "../lib/limit";
import { GUIDED_SCENARIOS } from "../lib/scenarios";
import type { AskResponse } from "../lib/types";

const EXAMPLE_QUESTIONS = GUIDED_SCENARIOS.map((s) => s.question);

async function runPipeline(question: string): Promise<AskResponse> {
  const { result: screening } = await screenQuestion(question);
  if (!screening.passed) {
    return {
      outcome: "blocked",
      answer: null,
      citations: [],
      screening,
      retrieval: { passages: [], k: 0, latencyMs: 0 },
      generation: null,
      grounding: null,
      cached: false,
    };
  }

  const retrieval = await retrieve(question);
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

  return {
    outcome: grounding.passed ? "answered" : "refused",
    answer: grounding.passed ? generation.answer : null,
    citations: grounding.passed ? deriveCitations(grounding) : [],
    screening,
    retrieval,
    generation: { tokensOut: generation.tokensOut, latencyMs: generation.latencyMs },
    grounding,
    cached: false,
  };
}

async function main() {
  for (const question of EXAMPLE_QUESTIONS) {
    console.log(`Warming: "${question}"`);
    const response = await runPipeline(question);
    console.log(`  -> ${response.outcome}`);
    await setCachedResponse(hashQuestion(question), response);
  }
  console.log("Done. All example questions cached.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
