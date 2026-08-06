// Runs the eval suite against the lib/ pipeline DIRECTLY — screen -> retrieve ->
// generate -> ground — not the deployed HTTP endpoint. No Turnstile, no rate limit, no
// cache pollution, and it works before anything is deployed (see CLAUDE.md Phase 6).
// Prints a scorecard and writes evals/results.md.
// See the note in scripts/ingest.ts — dotenv/config's default doesn't know about
// Next.js's ".env.local" convention.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { screenQuestion } from "../lib/screen";
import { retrieve } from "../lib/retrieve";
import { generateAnswer } from "../lib/generate";
import { groundAnswer, deriveCitations } from "../lib/ground";
import type { GroundingResult } from "../lib/types";

type EvalCase = {
  id: string;
  bucket: "answerable" | "unanswerable" | "adversarial";
  question: string;
  note?: string;
  expect: { outcome: "answered" | "refused" | "blocked"; expectCitesAnyOf?: string[] };
};

type CaseResult = {
  case: EvalCase;
  actualOutcome: "answered" | "refused" | "blocked";
  citations: string[];
  screeningReason: string;
  grounding: GroundingResult | null;
  latencyMs: number;
  correct: boolean;
  citationOk: boolean;
};

const GROUNDEDNESS_MIN_CLAIM_SCORE = Number(process.env.GROUNDEDNESS_MIN_CLAIM_SCORE ?? 0.4);
const SWEEP_THRESHOLDS = [0.5, 0.6, 0.7, 0.8];

async function runCase(evalCase: EvalCase): Promise<CaseResult> {
  const start = Date.now();

  const { result: screening } = await screenQuestion(evalCase.question);
  if (!screening.passed) {
    const actualOutcome = "blocked" as const;
    return {
      case: evalCase,
      actualOutcome,
      citations: [],
      screeningReason: screening.reason,
      grounding: null,
      latencyMs: Date.now() - start,
      correct: actualOutcome === evalCase.expect.outcome,
      citationOk: true,
    };
  }

  const retrieval = await retrieve(evalCase.question);
  const generation = await generateAnswer(evalCase.question, retrieval.passages);

  if ("ok" in generation) {
    const actualOutcome = "refused" as const;
    return {
      case: evalCase,
      actualOutcome,
      citations: [],
      screeningReason: screening.reason,
      grounding: null,
      latencyMs: Date.now() - start,
      correct: actualOutcome === evalCase.expect.outcome,
      citationOk: true,
    };
  }

  const grounding = await groundAnswer(generation.answer, retrieval.passages);
  if ("ok" in grounding) {
    const actualOutcome = "refused" as const;
    return {
      case: evalCase,
      actualOutcome,
      citations: [],
      screeningReason: screening.reason,
      grounding: null,
      latencyMs: Date.now() - start,
      correct: actualOutcome === evalCase.expect.outcome,
      citationOk: true,
    };
  }

  const actualOutcome = grounding.passed ? ("answered" as const) : ("refused" as const);
  const citations = grounding.passed ? deriveCitations(grounding) : [];
  const citationOk =
    !evalCase.expect.expectCitesAnyOf ||
    actualOutcome !== "answered" ||
    citations.some((c) => evalCase.expect.expectCitesAnyOf!.includes(c));

  return {
    case: evalCase,
    actualOutcome,
    citations,
    screeningReason: screening.reason,
    grounding,
    latencyMs: Date.now() - start,
    correct: actualOutcome === evalCase.expect.outcome && citationOk,
    citationOk,
  };
}

function bucketMetrics(results: CaseResult[]) {
  const n = results.length;
  const correct = results.filter((r) => r.correct).length;
  const falseRefusals = results.filter(
    (r) => r.case.expect.outcome === "answered" && r.actualOutcome !== "answered"
  ).length;
  const fabrications = results.filter(
    (r) => r.case.expect.outcome === "refused" && r.actualOutcome === "answered"
  ).length;
  const meanLatency = n ? Math.round(results.reduce((a, r) => a + r.latencyMs, 0) / n) : 0;
  return {
    n,
    accuracy: n ? correct / n : 0,
    falseRefusalRate: n ? falseRefusals / n : 0,
    fabricationRate: n ? fabrications / n : 0,
    meanLatency,
  };
}

function sweepThresholds(results: CaseResult[]) {
  // Reuses each case's already-computed grounding.score / minClaimScore — no extra
  // model calls. Only meaningful for cases that reached grounding (i.e. passed
  // screening and got a real generation); blocked cases are threshold-invariant.
  const grounded = results.filter((r) => r.grounding !== null);

  return SWEEP_THRESHOLDS.map((threshold) => {
    let falseRefusals = 0;
    let fabrications = 0;
    let answeredIntent = 0;
    let refusedIntent = 0;

    for (const r of grounded) {
      const g = r.grounding!;
      const passesAtThreshold = g.score >= threshold && g.minClaimScore >= GROUNDEDNESS_MIN_CLAIM_SCORE;
      const outcomeAtThreshold = passesAtThreshold ? "answered" : "refused";

      if (r.case.expect.outcome === "answered") {
        answeredIntent += 1;
        if (outcomeAtThreshold !== "answered") falseRefusals += 1;
      }
      if (r.case.expect.outcome === "refused") {
        refusedIntent += 1;
        if (outcomeAtThreshold === "answered") fabrications += 1;
      }
    }

    return {
      threshold,
      falseRefusalRate: answeredIntent ? falseRefusals / answeredIntent : 0,
      fabricationRate: refusedIntent ? fabrications / refusedIntent : 0,
      answeredIntent,
      refusedIntent,
    };
  });
}

function pct(x: number): string {
  return `${(x * 100).toFixed(1)}%`;
}

async function main() {
  const casesPath = join(__dirname, "cases.json");
  const cases: EvalCase[] = JSON.parse(readFileSync(casesPath, "utf-8"));

  console.log(`Running ${cases.length} eval cases against the pipeline directly...\n`);

  const results: CaseResult[] = [];
  for (const evalCase of cases) {
    const result = await runCase(evalCase);
    results.push(result);
    const mark = result.correct ? "PASS" : "FAIL";
    console.log(
      `[${mark}] ${evalCase.id} (${evalCase.bucket}) expected=${evalCase.expect.outcome} actual=${result.actualOutcome} ${result.latencyMs}ms`
    );
  }

  const buckets = ["answerable", "unanswerable", "adversarial"] as const;
  const byBucket = Object.fromEntries(
    buckets.map((b) => [b, bucketMetrics(results.filter((r) => r.case.bucket === b))])
  );
  const overall = bucketMetrics(results);
  const sweep = sweepThresholds(results);

  const lines: string[] = [];
  lines.push("# Eval results");
  lines.push("");
  lines.push(
    `Generated by \`npm run evals\`. Latency figures are for the **local pipeline, not the deployed edge** — evals call \`lib/\` directly (screen -> retrieve -> generate -> ground), bypassing Turnstile, rate limiting, and the HTTP layer entirely (see CLAUDE.md Phase 6).`
  );
  lines.push("");
  lines.push(`Configured threshold: **${process.env.GROUNDEDNESS_THRESHOLD ?? 0.7}**, min-claim floor: **${GROUNDEDNESS_MIN_CLAIM_SCORE}**.`);
  lines.push("");
  lines.push("## Scorecard");
  lines.push("");
  lines.push("| Bucket | N | Accuracy | False refusal rate | Fabrication rate | Mean latency |");
  lines.push("|---|---|---|---|---|---|");
  for (const b of buckets) {
    const m = byBucket[b];
    lines.push(`| ${b} | ${m.n} | ${pct(m.accuracy)} | ${pct(m.falseRefusalRate)} | ${pct(m.fabricationRate)} | ${m.meanLatency}ms |`);
  }
  lines.push(`| **overall** | ${overall.n} | ${pct(overall.accuracy)} | ${pct(overall.falseRefusalRate)} | ${pct(overall.fabricationRate)} | ${overall.meanLatency}ms |`);
  lines.push("");
  lines.push(
    "**Fabrication rate** — answered when it should have refused — is the headline metric. **False refusal rate** — refused/blocked when it should have answered — is the cost of being conservative."
  );
  lines.push("");
  lines.push("## Threshold sweep");
  lines.push("");
  lines.push(
    `Reruns the pass/fail decision at each threshold using each case's already-computed groundedness score — no extra model calls. Min-claim floor held fixed at ${GROUNDEDNESS_MIN_CLAIM_SCORE}.`
  );
  lines.push("");
  lines.push("| Threshold | False refusal rate | Fabrication rate |");
  lines.push("|---|---|---|");
  for (const s of sweep) {
    lines.push(`| ${s.threshold.toFixed(2)} | ${pct(s.falseRefusalRate)} | ${pct(s.fabricationRate)} |`);
  }
  lines.push("");
  lines.push("## Per-case detail");
  lines.push("");
  lines.push("| ID | Bucket | Expected | Actual | Correct | Groundedness | Latency |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const r of results) {
    const g = r.grounding ? r.grounding.score.toFixed(2) : "—";
    lines.push(
      `| ${r.case.id} | ${r.case.bucket} | ${r.case.expect.outcome} | ${r.actualOutcome} | ${r.correct ? "✓" : "✗"} | ${g} | ${r.latencyMs}ms |`
    );
  }
  lines.push("");

  const resultsPath = join(__dirname, "results.md");
  writeFileSync(resultsPath, lines.join("\n"));

  console.log("\n" + lines.join("\n"));
  console.log(`\nWrote ${resultsPath}`);

  const failed = results.filter((r) => !r.correct);
  if (failed.length > 0) {
    console.log(`\n${failed.length} case(s) failed: ${failed.map((r) => r.case.id).join(", ")}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
