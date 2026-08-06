// Main pipeline endpoint. Order matters: bot check -> rate limit -> cache -> spend cap
// -> screen -> retrieve -> generate -> ground. Screening and rate limiting always run
// before any model call that costs real money (non-negotiable #3); the spend cap is
// charged in two steps so a request blocked at screening only ever books the
// screening call's real cost (see lib/limit.ts).
import { NextResponse } from "next/server";
import { retrieve } from "@/lib/retrieve";
import { generateAnswer } from "@/lib/generate";
import { groundAnswer, deriveCitations } from "@/lib/ground";
import { screenQuestion } from "@/lib/screen";
import {
  getClientIp,
  hashIp,
  hashQuestion,
  checkRateLimit,
  getCachedResponse,
  setCachedResponse,
  adjustSpend,
  isSpendCapHit,
  verifyTurnstile,
  ESTIMATED_COST_SCREEN_USD,
  ESTIMATED_COST_PIPELINE_USD,
} from "@/lib/limit";
import type { AskResponse, ScreenResult } from "@/lib/types";

export const maxDuration = 60; // pipeline is 3-4 sequential model calls; see CLAUDE.md

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

export async function POST(req: Request) {
  let body: { question?: unknown; turnstileToken?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : "";

  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }
  if (question.length > 1000) {
    return NextResponse.json({ error: "question too long (max 1000 characters)" }, { status: 400 });
  }

  const ip = getClientIp(req.headers);
  const ipHash = hashIp(ip);
  const questionHash = hashQuestion(question);

  try {
    // 1. Bot check — before anything else touches the DB or a model.
    const turnstileOk = await verifyTurnstile(turnstileToken, ip);
    if (!turnstileOk) return NextResponse.json(blocked("bot_check_failed"));

    // 2. Rate limit — before any model call.
    const withinLimit = await checkRateLimit(ipHash);
    if (!withinLimit) return NextResponse.json(blocked("rate_limited"));

    // 3. Cache — identical questions cost nothing, and this is what keeps the
    //    pre-warmed example questions answerable even when the spend cap is hit.
    const cached = await getCachedResponse(questionHash);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    // 4. Spend cap, phase 1: charge the screening call's estimated cost up front.
    const totalAfterScreenCharge = await adjustSpend(ESTIMATED_COST_SCREEN_USD);
    if (isSpendCapHit(totalAfterScreenCharge)) {
      await adjustSpend(-ESTIMATED_COST_SCREEN_USD);
      return NextResponse.json(blocked("budget_exhausted"));
    }

    // 5. Screen.
    const { result: screening, modelCalled } = await screenQuestion(question);
    if (!screening.passed) {
      if (!modelCalled) await adjustSpend(-ESTIMATED_COST_SCREEN_USD); // deny-list caught it, no call made
      return NextResponse.json({ ...blocked(screening.reason, screening.latencyMs), screening });
    }

    // 6. Spend cap, phase 2: charge the rest of the pipeline (retrieval is free —
    //    gte-small runs in Supabase's edge runtime at no per-call cost to us — but
    //    generation + decomposition + entailment are three more Haiku calls).
    const totalAfterPipelineCharge = await adjustSpend(ESTIMATED_COST_PIPELINE_USD);
    if (isSpendCapHit(totalAfterPipelineCharge)) {
      await adjustSpend(-ESTIMATED_COST_PIPELINE_USD);
      return NextResponse.json({
        ...blocked("budget_exhausted"),
        screening,
      });
    }

    // 7. Retrieve.
    const retrieval = await retrieve(question);

    // 8. Generate.
    const generation = await generateAnswer(question, retrieval.passages);
    if ("ok" in generation) {
      const response: AskResponse = {
        outcome: "refused",
        answer: null,
        citations: [],
        screening,
        retrieval,
        generation: null,
        grounding: null,
        cached: false,
      };
      return NextResponse.json(response);
    }

    // 9. Ground.
    const grounding = await groundAnswer(generation.answer, retrieval.passages);
    if ("ok" in grounding) {
      const response: AskResponse = {
        outcome: "refused",
        answer: null,
        citations: [],
        screening,
        retrieval,
        generation: { tokensOut: generation.tokensOut, latencyMs: generation.latencyMs },
        grounding: null,
        cached: false,
      };
      return NextResponse.json(response);
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

    return NextResponse.json(response);
  } catch (err) {
    // Never let a provider or DB error surface as a raw stack trace.
    console.error("[/api/ask] unexpected error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
