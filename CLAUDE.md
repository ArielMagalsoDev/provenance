@AGENTS.md

# Provenance

_(originally built as "grounded-rag" — renamed 2026-08-08; same underlying pipeline,
repo/package technical names updated to match)_

Persistent context for Claude Code. Read this before any task in this repo.

---

## What this project is

A public portfolio demo of production RAG engineering. A retrieval system over a
fictional company's policy documents that **answers only from source material and
refuses when the sources don't support an answer**.

The point of the project is not the chatbot. It is the verification layer that catches
the model when it is about to fabricate, and the evidence (evals) that it works.

**Live at:** [provenance.arielmagalso.com](https://provenance.arielmagalso.com)
**Audience:** technical reviewers reading the code, and non-technical recruiters trying
the demo for 90 seconds.

---

## Non-negotiables

These are the things that make the project worth building. Do not compromise them for
convenience.

1. **The pipeline is visible in the UI.** Every response exposes screening result,
   retrieved passages with similarity scores, groundedness score, threshold, and the
   accept/reject decision.
2. **Refusal is a first-class outcome**, not an error state. It gets the same visual
   weight as an answer.
3. **Screening and rate limiting run before any expensive model call.** No exceptions.
4. **A global spend cap with a cached fallback must exist before the demo URL is shared
   anywhere.**
5. **No signup, no login, no API key entry, no cookie wall** on the demo path.
6. **Evals are committed and runnable** with results checked into the repo.

---

## Out of scope

Do not build these. If they seem necessary, stop and add a line to the
"Possible extensions" section of the README instead.

- User accounts, auth, sessions
- Document upload or corpus editing via UI
- Multi-turn conversation memory
- Streaming responses
- Reranking models, hybrid/BM25 search, query expansion
- Agentic tool use or multi-step planning
- Admin dashboard
- Mobile app

---

## Stack (fixed — amended 2026-08-06, see rationale below)

| Layer | Choice |
|---|---|
| Framework | Next.js App Router, TypeScript strict |
| Styling | Tailwind |
| DB / vectors | Supabase Postgres + pgvector |
| Embeddings | **Supabase built-in `gte-small` (384 dims), via a Supabase Edge Function** — not OpenAI |
| Generation | Claude API, **Haiku** — not Sonnet |
| Screening + grounding checks | Claude API, Haiku |
| Rate limit, cache, spend cap | **Supabase Postgres** (small tables + atomic SQL) — not Upstash Redis |
| Hosting | Vercel |
| Bot protection | Cloudflare Turnstile |

No additional dependencies without a stated reason. Prefer standard library and small,
well-known packages.

**Why the amendments:** this is a demo/portfolio project — cost and account sprawl are
the enemy, not model quality. Anthropic has no embeddings endpoint, so OpenAI was the
only way to get `text-embedding-3-small`; Supabase's free `gte-small` model removes that
account entirely. Haiku-only cuts per-query cost roughly 4-5x over a Sonnet-generation
pipeline (~$0.003–0.005/query vs ~$0.01–0.02) with no impact on the thing being
demonstrated (verification, not generation quality). Folding rate limit / cache / spend
cap into the Supabase project already provisioned for pgvector removes the Upstash
account too — Postgres round-trip latency (~50ms) is irrelevant next to multi-second
model calls.

---

## Environment variables

```
ANTHROPIC_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY
TURNSTILE_SECRET_KEY
NEXT_PUBLIC_TURNSTILE_SITE_KEY
GROUNDEDNESS_THRESHOLD=0.70
GROUNDEDNESS_MIN_CLAIM_SCORE=0.40
RETRIEVAL_K=4
DAILY_SPEND_CAP_USD=5
RATE_LIMIT_PER_HOUR=10
```

No `OPENAI_API_KEY`, no `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — see stack
amendments above.

Never commit `.env`. Provide `.env.example` with every key present and no values.

`GROUNDEDNESS_MIN_CLAIM_SCORE` is a per-claim floor added on top of the spec's mean
threshold — see "Grounding gate" below.

---

## Directory structure

```
/app
  page.tsx                  demo UI
  evals/page.tsx            public scorecard
  api/
    ask/route.ts            main pipeline endpoint
    corpus/route.ts         serve corpus passages for inspection
/lib
  embed.ts                  embedding calls (Supabase edge function)
  retrieve.ts                vector search
  generate.ts                answer generation with citations
  ground.ts                  claim decomposition + entailment scoring
  screen.ts                  injection / off-topic screening
  limit.ts                   rate limiting + spend cap + cache (Postgres-backed)
  types.ts                   shared types
/corpus
  *.md                       fictional company docs, committed
/scripts
  ingest.ts                  chunk + embed + upsert
/evals
  cases.json
  run.ts
  results.md                 generated, committed
/supabase
  migrations/
  functions/embed/           gte-small embedding edge function
CLAUDE.md
README.md
```

---

## Database schema

```sql
create extension if not exists vector;

create table passages (
  id           text primary key,        -- e.g. "refunds-03"
  source_file  text not null,           -- e.g. "refunds.md"
  heading      text,
  content      text not null,
  token_count  int not null,
  embedding    vector(384) not null,    -- gte-small, not 1536 (no OpenAI)
  created_at   timestamptz default now()
);

-- No ivfflat index. At 60-100 rows an ivfflat index (lists=100) is built on
-- effectively no data and hurts recall rather than helping it. Exact scan is both
-- correct and fast at this corpus size. Revisit if the corpus grows past ~5k rows.
```

Passage IDs must be human-readable and stable — they appear in citations and in eval
expectations.

Supporting tables (`rate_limits`, `response_cache`, `spend_ledger`) are Postgres
replacements for the spec's Upstash Redis role — see `lib/limit.ts` and the migration
that creates them for the exact shape.

---

## Core types

```ts
export type Passage = {
  id: string;
  sourceFile: string;
  heading: string | null;
  content: string;
};

export type RetrievedPassage = Passage & { similarity: number };

export type ScreenResult = {
  passed: boolean;
  // "bot_check_failed" added on top of the original spec's union — see note below.
  reason: "ok" | "injection" | "off_topic" | "rate_limited" | "budget_exhausted" | "bot_check_failed";
  latencyMs: number;
};
```

Amendment: `"bot_check_failed"` was added to the reason union so a Turnstile failure renders
in the same pipeline panel as every other outcome, instead of being a special-cased raw
HTTP error that breaks the "every response exposes the pipeline" non-negotiable.

```ts

export type Claim = {
  text: string;
  supported: boolean;
  supportingPassageIds: string[];
  score: number;
};

export type GroundingResult = {
  score: number;              // 0..1, mean of claim scores
  minClaimScore: number;      // 0..1, lowest individual claim score
  threshold: number;
  minClaimFloor: number;
  passed: boolean;
  claims: Claim[];
};

export type AskResponse = {
  outcome: "answered" | "refused" | "blocked";
  answer: string | null;
  citations: string[];        // passage IDs
  screening: ScreenResult;
  retrieval: { passages: RetrievedPassage[]; k: number; latencyMs: number };
  generation: { tokensOut: number; latencyMs: number } | null;
  grounding: GroundingResult | null;
  cached: boolean;
};
```

`AskResponse` is the contract between the API and the UI. The UI renders the pipeline
panel directly from it. Do not change its shape without updating both sides.

---

## Grounding gate (amended)

The spec's original rule — "mean of claim scores below threshold → refuse" — lets one
fabricated claim hide inside several well-supported ones (four supported claims at 0.9
plus one invented claim at 0.0 still means 0.72, which passes a 0.70 threshold). Gate on
**both**:

```
passed = (mean(claims.score) >= GROUNDEDNESS_THRESHOLD)
      && (min(claims.score)  >= GROUNDEDNESS_MIN_CLAIM_SCORE)
```

`score` in the response stays the mean (that's what's displayed as "Groundedness"); the
per-claim floor is a silent second gate. Tune both during the Phase 6 threshold sweep.

---

## Build phases

Work one phase at a time. Do not start the next phase until the acceptance criteria
pass.

### Phase 1 — Corpus

Write a fictional company's policy docs in `/corpus`. Suggested: a co-working space.
Give it an obviously invented name.

Cover: pricing tiers, membership limits, booking and cancellation, refunds, hours and
access, guest policy, damage liability, equipment.

**Critical requirement — build the gaps deliberately.** The corpus must *not* answer a
meaningful set of plausible customer questions. Pick 5–8 topics and never mention them
anywhere: insurance coverage, corporate invoicing, accessibility specifics, pet policy,
parking, data privacy.

Also write 2–3 **near-miss passages**: content that is topically adjacent to a gap and
will retrieve with high similarity, but does not actually answer the question. These are
the cases that break naive RAG.

Target 60–100 passages after chunking.

**Acceptance:** corpus committed; `corpus/COVERAGE.md` lists every topic the corpus does
and does not answer.

### Phase 2 — Ingestion and retrieval

`scripts/ingest.ts`: read `/corpus`, split on headings then paragraphs, target 200–400
tokens with ~15% overlap, embed via the Supabase edge function, upsert into `passages`.

`lib/retrieve.ts`: cosine similarity top-k, exact scan (no ivfflat — see schema note).

**Acceptance:** `npm run ingest` populates the table; a direct retrieve call returns
ranked passages with similarity scores.

### Phase 3 — Generation with citations

`lib/generate.ts`. System prompt instructs: answer only from the supplied passages; cite
passage IDs; if the passages do not cover the question, say so.

Request structured JSON output: `{ answer, citations[], usedPassageIds[] }`. Parse
defensively — strip code fences, fall back gracefully on malformed JSON.

**Acceptance:** answerable questions return an answer with at least one valid citation
resolving to a real passage ID.

### Phase 4 — Groundedness layer

This is the headline feature. Give it the most care.

`lib/ground.ts`:

1. Decompose the generated answer into atomic claims (Haiku call).
2. Score entailment for every claim against the retrieved passages **in one batched
   Haiku call** (not one call per claim — cuts latency and cost ~4x) — return `0..1` and
   supporting passage IDs per claim.
3. Add a cheap lexical-overlap signal per claim as a sanity check against model
   over-agreement.
4. Gate per "Grounding gate" above (mean **and** per-claim floor). Below threshold →
   discard the answer, return `outcome: "refused"` with an explanation of what wasn't
   supported.

Return the full `GroundingResult` to the client — the UI displays it.

**Threshold selection must be evidence-based.** After Phase 6, run the eval set at
thresholds 0.5 / 0.6 / 0.7 / 0.8 and record the false-refusal and fabrication rates at
each. Document the choice in the README.

**Acceptance:** every gap question from `COVERAGE.md` produces a refusal, and the score
that caused it is visible in the response.

### Phase 5 — Screening, limits, spend cap

`lib/screen.ts` — runs first, before retrieval and generation:

- Fast deny-list regex for **unambiguous** injection patterns only (e.g. "ignore all
  previous instructions", "reveal your system prompt"). A legit question that happens to
  contain a word like "ignore" must not be regex-blocked — route anything ambiguous to
  the classifier instead. Covered by an eval case.
- Haiku classifier for injection and off-topic.

`lib/limit.ts` (Postgres-backed, not Redis):

- Per-IP rate limit, `RATE_LIMIT_PER_HOUR`, via an atomic upsert-and-count query.
- Response cache keyed on normalised question hash, storing the **full `AskResponse`**
  (with `cached: true` set on serve) so the pipeline panel still renders on a cache hit.
  TTL 24h.
- **Global daily spend cap.** Track estimated spend in a Postgres ledger table via
  `INCRBYFLOAT`-equivalent atomic SQL, charged *before* each model call and refunded on
  failure — this must be race-safe under concurrent requests. When
  `DAILY_SPEND_CAP_USD` is hit, serve cached canned responses for the three example
  questions (pre-warmed at ingest time) and return `reason: "budget_exhausted"` for
  everything else, with a UI banner. This is a hard requirement.
- Turnstile verification on the request.
- `max_tokens` capped on every model call.

**Acceptance:** a pasted injection is blocked with zero generation calls made; setting
the cap to `0.01` triggers the fallback path correctly.

### Phase 6 — Evals

`evals/cases.json` — ~40 cases:

```json
{
  "id": "unans-04",
  "bucket": "unanswerable",
  "question": "Do you have parking for members?",
  "expect": { "outcome": "refused" }
}
```

Buckets:

- `answerable` (~20) — expect `answered`, ≥1 citation, grounding above threshold.
  Include `expectCitesAnyOf` where a specific passage should be cited.
- `unanswerable` (~12) — expect `refused`, no citations. Must include every near-miss
  from Phase 1.
- `adversarial` (~8) — injections, jailbreaks, off-topic. Expect `blocked` at screening.
  Include at least one "looks adversarial but isn't" case (expects `answered` or
  `refused`, never `blocked`) to catch regex over-blocking.

`evals/run.ts` — calls the `lib/` pipeline **directly** (screen → retrieve → generate →
ground), not the deployed HTTP endpoint. This means no Turnstile, no rate limit, no
cache pollution from eval runs, and it works before anything is deployed. Prints a
scorecard, writes `evals/results.md`. Latency figures in that file are labeled
"local pipeline, not edge" since they skip the HTTP/Turnstile layer.

Report per bucket: accuracy, false refusal rate, fabrication rate (answered when it
should have refused), mean latency.

**Acceptance:** `npm run evals` produces a committed scorecard.

### Phase 7 — Demo UI

Single page. Optimised for a recruiter with 90 seconds and no RAG knowledge.

- One sentence explaining the system, then the input. Nothing above it.
- **Three example chips**, labelled by what they demonstrate rather than by their
  question text:
  - "Ask something the docs answer" → cited answer
  - "Ask something the docs don't cover" → refusal
  - "Try to jailbreak it" → blocked
- **Pipeline panel** below each response, expanded by default, rendered from
  `AskResponse`:

```
Screening        passed          12ms
Retrieval        4 passages      0.81 / 0.79 / 0.74 / 0.71
Generation       done            412 tokens
Groundedness     0.31            below 0.70 threshold → discarded
Result           refused
```

- Retrieved passages expandable inline with their similarity scores.
- **Link to the corpus** so a reviewer can verify a refusal was correct. This is what
  separates "it said I don't know" from "it correctly said I don't know."
- Link to `/evals`.

Visual design: restrained, typographic, generous whitespace. Use design tokens and an
8px spacing scale. No decorative gradients or animation. Restraint reads as competence
here.

**Acceptance:** a person unfamiliar with RAG can click a chip and explain what happened.

### Phase 8 — README

In this order:

1. One-line claim
2. Live demo link
3. The problem — why fabricated pricing and policy claims are expensive (2–3 sentences)
4. Architecture diagram
5. **Screenshot of a refusal** — lead with the interesting behaviour, not a successful
   answer
6. Eval scorecard table
7. Design decisions — chunk size, `k`, threshold selection with the data behind it, why
   screening runs pre-model, why Haiku-only, why Supabase embeddings instead of OpenAI
8. Tradeoffs and limitations — what breaks at scale, what the grounding check gets
   wrong (same-model-grades-itself is a real weakness — say so), what's next
9. Run locally, verified from a clean clone

Section 8 is not optional. Honest limitations read as senior; overclaiming reads as
junior.

---

## Working conventions

- TypeScript strict. No `any` without a comment justifying it.
- Every model call wrapped in try/catch with a typed error result. Never let a provider
  error surface as a raw stack trace in the UI.
- Log timings for each pipeline stage — the UI displays them.
- Keep `lib/` modules pure and independently testable; the route composes them.
- Small, focused commits with meaningful messages. This repo is read by recruiters — the
  commit log is part of the portfolio.
- No secrets, no client names, no content from any real client project anywhere in this
  repo or its history.

---

## Commands

```
npm run dev        # local dev
npm run ingest     # chunk, embed, upsert corpus
npm run evals      # run eval suite, write results.md
npm run build      # production build
```

---

## If time runs short

Cut Phase 7 polish before cutting Phase 6 evals. A plain demo with a rigorous eval suite
beats a beautiful demo with none — the evals are what a technical interviewer will
actually ask about.
