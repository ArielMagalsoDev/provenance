# HANDOFF — grounded-rag / Meridian Assist

Read this first in a new session before touching anything. Written 2026-08-06 at the
end of a long build session; **updated 2026-08-07** — see "Update: Agent Inbox + custom
knowledge upload" near the end for what changed since.

## What this is

A RAG portfolio demo ("grounded-rag") that only answers from source documents and
refuses when it can't — repositioned mid-session into **Meridian Assist**, a business-
framed "auditable support automation" product story for coworking operators, then
skinned twice more (a custom mockup, then Meta's Quest/Ray-Ban commerce design system
+ shadcn/ui). The underlying pipeline never changed across any of that — only
presentation layers were added on top.

Three source-of-truth docs, read in this order for depth:
1. **This file** — current state, gotchas, what to do next.
2. `CLAUDE.md` (repo root) — the original grounded-rag technical spec + amendments.
3. `docs/PRODUCT-PLAN.md` — the Meridian Assist business-repositioning plan.
4. `C:\Users\ariel\OneDrive\Documents\Claude Code FIles\PLAN-grounded-rag.md` — the
   cross-project orchestration log (this project is one of several Ariel runs from
   that hub; that file has the full session-by-session history).

## Current state — read this before doing anything

- **Code is fully built and locally verified.** Typecheck clean, `npm run build`
  clean, all pages manually verified in-browser, full eval suite passing.
- **Git: two commits exist on `main`**, both pushed and live at
  **https://grounded-rag-six.vercel.app** (`ArielMagalsoDev/grounded-rag`, public):
  the original base build, then a second commit covering the Meridian Assist ticket
  layer + all three design passes (Meta → mockup → Salix) + every fix made along the
  way. **Run `git status` before anything else** — the Agent Inbox / custom-upload
  work (below) is uncommitted on top of that.
- **Commit history was rewritten once** (2026-08-07, `git filter-branch` +
  force-push) to strip a `Co-Authored-By: Claude` trailer that had leaked into the
  first commit from an earlier session — see [[no-claude-coauthor-trailer]] in
  memory. **Never add that trailer to a commit in this repo** (or any of Ariel's
  repos — it adds "claude" to the GitHub Contributors list, which he doesn't want).
- **Standing rule: never commit, push, or deploy without Ariel explicitly saying so.**
  Build, verify locally, stop, report. This has held all session — don't break it.

## Where things live

| What | Where |
|---|---|
| Code | `C:\Users\ariel\grounded-rag` (outside OneDrive on purpose — don't move it) |
| GitHub | `ArielMagalsoDev/grounded-rag`, public, `main` branch, connected to Vercel for auto-deploy-on-push |
| Vercel | project `ariel-m-projects/grounded-rag` → `https://grounded-rag-six.vercel.app` |
| Supabase | project `grounded-rag`, ref `vtjswmwbcwfonvmxjapz`, region us-east-1, org `tuvcfqwegncujzrmboca` (Ariel's personal org). URL: `https://vtjswmwbcwfonvmxjapz.supabase.co` |
| Secrets | `.env.local` (gitignored, already populated with real Anthropic + Supabase keys — don't ask Ariel for them again, they're already on disk) |
| Local dev server config | `.claude/launch.json` in **the OneDrive session root**, not this repo — entry name `grounded-rag`, runs `start-dev.cmd` in this repo, port 3000 with autoPort |

## Non-negotiables (from CLAUDE.md — do not compromise these)

1. Every response's pipeline (screening, retrieval scores, groundedness, threshold,
   decision) is visible in the UI — nothing hidden.
2. Refusal is a first-class outcome, same visual weight as an answer.
3. Screening + rate limiting run before any paid model call, no exceptions.
4. Global daily spend cap + cached fallback must work before any URL is public — it's
   verified working (tested by forcing the ledger over cap; new questions correctly
   blocked, cached guided scenarios still answered).
5. No signup/login/API key entry/cookie wall on the demo path.
6. Evals are committed and runnable (`npm run evals` → `evals/results.md`).

## Architecture (unchanged since the original build — still true)

Pipeline, in order, for every question: **bot check → rate limit → cache → spend cap
→ screen → retrieve → generate → ground → route**. Lives in `lib/pipeline.ts`
(`runAskPipeline`), shared by `/api/ask` (question/answer contract) and `/api/tickets`
(Meridian Assist ticket contract, via `lib/tickets.ts`'s `runTicket` which wraps
`AskResponse` into `AutomationDecision` and writes a real, persisted `audit_events`
row per stage — only the downstream send/escalate *action* is simulated).

Key files:
- `lib/screen.ts` — deny-list regex + Haiku classifier
- `lib/retrieve.ts` — cosine similarity via Postgres `match_passages` RPC (exact scan,
  no ivfflat — corpus is too small for an ivfflat index to help; see the migration
  comment)
- `lib/generate.ts` — Haiku generates answer + self-reported citations (self-report is
  NOT trusted for display, see gotcha below)
- `lib/ground.ts` — decompose into claims, batch-score entailment, lexical sanity
  check, gate on **mean ≥ 0.70 AND min claim ≥ 0.40** (not mean alone — a single
  fabricated claim among several supported ones must not slip through)
- `lib/limit.ts` — Postgres-backed rate limit / cache / spend cap (no Redis)
- `lib/tickets.ts` — ticket ↔ `AutomationDecision` mapping, human-readable routing
  reasons, `CORPUS_VERSION = "v1-2026-08-06"` (bump manually if `/corpus` changes)
- `lib/scenarios.ts` — **single source of truth** for the 3 guided demo scenarios;
  `scripts/warm-cache.ts` imports it, and `evals/cases.json`'s `scenario-1/2/3` cases
  mirror it by hand (JSON can't import TS — keep these in sync manually if scenarios
  change)

Data: Supabase Postgres + pgvector. `passages` (51 rows, gte-small 384-dim
embeddings via a Supabase Edge Function — no OpenAI key anywhere), plus
`rate_limit_events`, `response_cache`, `spend_ledger`, `audit_events`. All RLS-locked
to `service_role` only; RPC functions have `EXECUTE` explicitly revoked from
`anon`/`authenticated` (a security-advisor finding, already fixed).

Corpus: `/corpus/*.md`, a fictional company "Meridian Nine Coworking." 6 deliberate
gap topics (insurance, corporate invoicing, accessibility, pets, parking, data
privacy) + 4 near-miss passages designed to tempt fabrication, documented in
`corpus/COVERAGE.md`. **Do not add real content or touch corpus files without
re-running `npm run ingest` and `npm run warm-cache` after** (see gotchas).

Evals: `evals/cases.json`, 43 cases, `npm run evals` → `evals/results.md`. Last known
result: **100% accuracy, 0% fabrication, 0% false refusal** across all three buckets
— but that's a snapshot; re-run it yourself before trusting it or showing it to
anyone, especially after any prompt/corpus change.

## Gotchas already found and fixed — do not reintroduce these

1. **`server-only` package doesn't work here.** Its guard resolves via a
   `"react-server"` export condition Next.js's bundler sets — under plain Node
   (`tsx`, used by `scripts/ingest.ts`, `scripts/warm-cache.ts`, `evals/run.ts`) it
   throws unconditionally. Not used anywhere in this repo. Don't add it back.
2. **Anthropic/Supabase clients must be lazy singletons**, not constructed at module
   scope (`getAnthropic()` / `getSupabaseAdmin()` in `lib/anthropic.ts` /
   `lib/supabaseAdmin.ts`). Module-scope construction throws if env vars aren't set at
   import time, which breaks `next build` on any machine without `.env.local`
   populated (CI, fresh clone).
3. **`dotenv/config`'s default only loads `.env`, not `.env.local`.** All three
   scripts (`ingest.ts`, `warm-cache.ts`, `evals/run.ts`) explicitly do
   `loadEnv({ path: ".env.local" })`. If you add a new script that touches the
   pipeline, do the same.
4. **The embed Edge Function is one-text-per-call, not batched.** An earlier version
   batched multiple texts per invocation and looped `model.run()` inside one Deno
   isolate — crashed with `WORKER_RESOURCE_LIMIT` once cumulative content got large
   enough (looked count-based at first, was actually memory pressure). `lib/embed.ts`
   fans out with client-side concurrency (5 at a time) instead. Don't re-batch it.
5. **Model calls need `temperature: 0`.** Without it, the same question could flip
   outcome between runs (caught because a guided demo scenario changed its lesson on
   a repeat click). Pinned in `lib/generate.ts`, `lib/ground.ts` (both calls),
   `lib/screen.ts`.
6. **Even at temp 0, watch for concept conflation in grounding.** A real bug: the
   verifier let a passage about *liability/responsibility* support a claim about
   *insurance coverage* — related but distinct concepts, and Haiku doesn't
   automatically separate them. Fixed with explicit anti-conflation instructions in
   both `lib/generate.ts`'s system prompt and `lib/ground.ts`'s entailment-scoring
   prompt. If you see grounding pass on a claim that "morally" shouldn't, suspect this
   pattern first.
7. **Citations shown to the user come from `deriveCitations()` in `lib/ground.ts`
   (verified `supportingPassageIds` per claim), never from `generation.citations`
   directly.** Haiku's self-reported citations array doesn't reliably stay in sync
   with the answer text it wrote — observed directly in eval runs (fully-grounded,
   specific answers with an empty citations array). Don't wire a UI back to
   `generation.citations`.
8. **Response cache does not auto-invalidate on corpus changes.** It's keyed on
   normalized question text only. After `npm run ingest`, always
   `truncate table response_cache;` (or wait out the 24h TTL) and re-run
   `npm run warm-cache`, or stale pre-corpus-change answers will keep serving.
9. **Tailwind v4 cascade layers: unlayered CSS always beats the utility layer**,
   regardless of specificity or source order. A plain `a { color: inherit }` outside
   any `@layer` was silently eating shadcn Button's `text-[var(--on-ink-button)]`
   utility class — every primary button rendered invisible near-black-on-black text
   until this was caught by *looking at a screenshot* (typecheck/build don't catch
   this class of bug). Base element resets now live in `@layer base` in
   `app/globals.css`. If you add more plain-element CSS, put it in `@layer base` too.
10. **shadcn's `init` CLI will silently overwrite conflicting CSS variable names.**
    It clobbered the Meta design token `--primary` (cobalt `#0064e0`) with its own
    default (near-black) because both systems used the same variable name. If you
    re-run `shadcn add` or `shadcn init`, diff `app/globals.css` after — don't trust
    it to merge cleanly.
11. **ivfflat index deliberately not used** on `passages` — see the migration
    comment. Exact scan is correct at this corpus size (51 rows); don't "fix" this by
    adding an index back without reconsidering at real scale (~5k+ rows).
12. **Browser testing tool quirk, not a code bug**: in this session's browser
    automation tool, `screenshot` and `read_page` occasionally return a stale frame
    right after `navigate` — pressing `Home` (scroll-to-top) or re-navigating usually
    resolves it. Don't chase this as an app bug if a screenshot looks wrong
    immediately after navigating; re-check before concluding something's broken.

## Design system (current — as of this handoff)

The **Meta commerce design system** (from a doc Ariel supplied, extracted from Meta's
Quest/Ray-Ban commerce pages) is what's live in the code right now, with shadcn/ui
components layered on top. An earlier custom-mockup-based design (warm paper palette,
serif headlines) was fully replaced — don't resurrect it, it's gone from
`app/globals.css`.

- **Font**: Montserrat (`next/font/google` in `app/layout.tsx`) — the documented
  fallback for Meta's proprietary "Optimistic VF," which isn't licensable. No Meta
  logo/wordmark used anywhere in the app — only the abstract token system (colors,
  spacing, radii, component shapes) applied to Meridian Assist's own content.
- **Color**: cobalt `--primary: #0064e0` reserved for the one "buy-cta"/commit moment
  (Send/Escalate button in the demo). Marketing surfaces (landing page, nav) use black
  pill buttons (`variant="ink"` on shadcn `Button`, defined in
  `components/ui/button.tsx`). Semantic badges (`success`/`warning`/`critical`,
  `components/ui/badge.tsx`) map directly onto `approved`/`human_review`/`blocked`.
- **Shape**: pill buttons (`rounded-full`) everywhere, `32px` card rounding, no
  hover-state fussing (matches the source doc's "no hover documented" note).
- **shadcn components in use**: `Button`, `Select` (channel picker in
  `TicketWorkflow.tsx`), `Accordion` (architecture page stages), `Badge`. All four
  have custom variants added on top of shadcn's defaults — see
  `components/ui/*.tsx`, they're fully-owned source files now, not a locked
  dependency.
- All design tokens live as CSS custom properties in `app/globals.css` (`--primary`,
  `--ink-deep`, `--surface-soft`, `--r-*` radius scale, `--s-*` spacing scale, etc.).

## Env vars (already set in `.env.local`)

```
ANTHROPIC_API_KEY               # real key, already populated
SUPABASE_URL                    # https://vtjswmwbcwfonvmxjapz.supabase.co
SUPABASE_SERVICE_ROLE_KEY       # real key, already populated
TURNSTILE_SECRET_KEY            # Cloudflare's published TEST key (1x0000...AA) — always passes, safe for local dev, NOT set up for a real account yet
NEXT_PUBLIC_TURNSTILE_SITE_KEY  # matching test site key (1x00000000000000000000AA)
GROUNDEDNESS_THRESHOLD=0.70
GROUNDEDNESS_MIN_CLAIM_SCORE=0.40
RETRIEVAL_K=4
DAILY_SPEND_CAP_USD=5
RATE_LIMIT_PER_HOUR=10
WORKSPACE_TTL_MINUTES=30         # optional, defaults to 30 if unset — Agent Inbox / upload overlay retention
```

Same values are set on Vercel for `production` + `preview` environments already (set
via `vercel env add` during the original deploy — still using the Turnstile test keys
there too, which is fine short-term since rate-limit + spend-cap still bound worst
case, but should be swapped before the URL is shared widely).

## Commands

```bash
npm run dev          # local dev server
npm run build         # production build (also run before claiming anything works)
npm run ingest        # chunk, embed, upsert /corpus — re-run after any corpus edit
npm run warm-cache    # pre-warm the 3 guided-scenario answers — re-run after ingest or scenario changes
npm run evals         # 43-case suite → evals/results.md
```

Use the `Browser` preview tools (not raw `npm run dev` in a terminal) to actually look
at pages — this project's launch.json entry is named `grounded-rag`, configured in
the **session root's** `.claude/launch.json`, not inside this repo.

## Update: Agent Inbox + custom knowledge upload (2026-08-07, uncommitted)

Two new features on top of the unchanged pipeline, both built on one mechanism — a
per-visitor, cookie-identified, time-limited **workspace overlay** on the `passages`
table. Full design: `docs/PLAN-hitl-and-workspaces.md`. **Uncommitted** — say go.

- **Isolation is by cookie, never by IP** — an `httpOnly`/`Secure`/`SameSite=Lax`
  random UUID (`lib/workspace.ts`), minted server-side on first write (approve or
  upload). IP hash stays scoped to rate-limiting only; keying content visibility off
  IP would leak between visitors sharing a public IP (office/café WiFi, CGNAT).
- **`passages` gained `workspace_id uuid null` + `origin` (`corpus|learned|uploaded`)**.
  `match_passages` now takes `p_workspace`, `p_include_shared`, `p_ttl_minutes` and
  filters overlay rows by `created_at > now() - ttl` **in the query itself** — expiry
  is exact and doesn't depend on a cleanup job having run recently. Retention is 30
  min (`WORKSPACE_TTL_MINUTES` env var), for both uploaded docs and learned
  corrections — one TTL, not two policies to reason about.
- **New `tickets` table** — tickets were ephemeral before (only `audit_events`
  persisted); the inbox needs a real queue. Also stores the full `AskResponse` per
  ticket (`ask_response` column) so the inbox renders the exact same evidence panel
  as `/demo` — non-negotiable #1 applies there too.
- **Agent Inbox** (`/inbox`, `lib/inbox.ts`, `app/api/inbox*`): lists escalated
  tickets, operator edits/approves a response → embedded as a `learned-*` passage in
  their workspace → the **stale cached refusal for that exact question is deleted**
  (same gotcha as #8 below, just a new call site) so a same-session replay answers
  immediately, citing an "Operator approved" badge.
- **Custom knowledge upload** (`WorkspaceUpload.tsx` on `/demo`, `app/api/workspace/*`):
  .md/.txt/.pdf → `lib/chunk.ts` (chunker extracted out of `scripts/ingest.ts`, now
  shared) → embedded (free) → `origin='uploaded'` passages. PDF text extraction via
  **`unpdf`** (new dependency — serverless-friendly, no native binaries; the one
  library this feature genuinely needs). Caps: 2 MB / 40 pages / 120k extracted
  chars / 40 passages.
- **Evals**: 2 new cases (`ws-01`, `ws-02`) in `evals/cases.json`, gated by a
  `"workspace": true` flag. `evals/run.ts` sets up a fixed-UUID fixture workspace
  before the run and tears it down after (in a `finally`) — self-healing if a
  previous teardown ever fails, since the next run's setup just upserts onto the
  same id. All **45 cases pass, 100%/0%/0%** — the original 43 are unaffected.

New gotchas from building this:

13. **Supabase-js query builders are "thenable"** — `await`-ing one early (e.g. to
    return it from a helper function) resolves it into a plain response object with
    no more query methods on it. Chain `.limit()`/`.select()`/etc. *before* the only
    `await`, never after. Bit `lib/inbox.ts`'s first draft of the shared
    workspace-or-null filter helper.
14. **`git filter-branch` also rewrites your local `refs/remotes/origin/*` tracking
    ref**, which makes `--force-with-lease`'s stored comparison point stale and the
    push gets rejected as "stale info" — even though the actual remote hasn't
    changed. Fix: `git fetch origin main` before retrying the force-push (or use
    `--force-with-lease=main:<known-remote-hash>` explicitly).
15. **`repeat(N, 1fr)` grid tracks don't shrink below their content's min-content
    size** — same underlying CSS Grid behavior as gotcha 9's cascade-layer bug, but
    a different trigger: a plain `1fr` track (not `minmax(0, 1fr)`) can force a whole
    grid to overflow if one cell's content is wider than its 1/N share. Bit the
    Business Impact Calculator's stat grid on mobile during the Salix redesign;
    fixed by switching the shared `.grid-2/3/4/split` utility classes to
    `minmax(0, Nfr)` tracks everywhere, not just the one call site that broke.
16. **Never mount two `TurnstileWidget`s on one page.** Next.js `<Script>` dedupes
    by src, and with two widget instances the *first* one's callback silently never
    fires — its token stays empty forever, so every ticket submit came back
    "blocked (bot_check_failed)" regardless of the question, while the second
    widget worked fine. One widget per page; children that need the token take it
    as a prop (see `WorkspaceUpload`'s header comment).
17. **RPC TTL parameters are Postgres ints — pass whole minutes, not fractional
    hours.** `get_cached_response` originally took `p_ttl_hours int`; the
    30-minute workspace cache TTL became `0.5`, Postgres threw `invalid input
    syntax for type integer: "0.5"`, and every workspace-scoped ask 500'd.
    Migration `cache_ttl_minutes` replaced it with `p_ttl_minutes int` (24h =
    1440). If you add a new time-bounded RPC, take minutes as int from the start.
18. **Workspace-mode screening needs its own topic scope.** The screening
    classifier is hard-scoped to coworking topics; with an uploaded document
    active, every question about that document classified "off_topic" and got
    blocked before retrieval — the upload feature was unusable until
    `screenQuestion(question, workspaceActive)` learned to widen the off_topic
    definition when overlay content exists. Injection rules identical in both
    modes; only the topic scope changes.

## Outstanding decisions / next actions

1. **Say go to commit + push the Agent Inbox / upload work** (everything in the
   "Update" section above). A push to `main` auto-deploys via the existing
   Vercel↔GitHub connection. `unpdf` needs `npm install` on whatever machine deploys
   it — already in `package.json`/`package-lock.json` once committed, so a normal
   Vercel build picks it up automatically.
2. **Refusal screenshot for the README** (`docs/refusal-screenshot.png`) — still never
   actually captured to disk; ask a question the corpus doesn't cover (e.g. parking)
   on `/demo` and screenshot the resulting panel.
3. **Real Cloudflare Turnstile account** — currently using published test keys. Fine
   for now, worth doing before the URL is shared beyond Ariel.
4. **Custom domain** — deferred by Ariel ("we change it later"). Two candidates
   floated: `rag.arielmagalso.com` (matches original naming) vs
   `assist.arielmagalso.com` (matches the Meridian Assist business repositioning).
   Not decided.
5. **`docs/PRODUCT-PLAN.md` Phases 3-5** are still unbuilt: a held-out eval set (the
   current 100%/0%/0% is a dev-set number the pipeline was iterated against directly —
   not proof it generalizes), a real external integration (webhook intake, one
   downstream connector), and a walkthrough video. All explicitly out of scope for
   what's been built so far, not forgotten.
