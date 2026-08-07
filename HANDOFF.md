# HANDOFF — grounded-rag / Provenance

Read this first in a new session before touching anything. Written 2026-08-06 at the
end of a long build session; **updated 2026-08-07** — see "Update: Agent Inbox + custom
knowledge upload" near the end for what changed since.

## What this is

A RAG portfolio demo ("grounded-rag") that only answers from source documents and
refuses when it can't — repositioned mid-session into **Provenance**, a business-
framed "auditable support automation" product story for coworking operators, then
skinned twice more (a custom mockup, then Meta's Quest/Ray-Ban commerce design system
+ shadcn/ui). The underlying pipeline never changed across any of that — only
presentation layers were added on top.

Three source-of-truth docs, read in this order for depth:
1. **This file** — current state, gotchas, what to do next.
2. `CLAUDE.md` (repo root) — the original grounded-rag technical spec + amendments.
3. `docs/PRODUCT-PLAN.md` — the Provenance business-repositioning plan.
4. `C:\Users\ariel\OneDrive\Documents\Claude Code FIles\PLAN-grounded-rag.md` — the
   cross-project orchestration log (this project is one of several Ariel runs from
   that hub; that file has the full session-by-session history).

## Current state — read this before doing anything

- **Code is fully built and locally verified.** Typecheck clean, `npm run build`
  clean, all pages manually verified in-browser, full eval suite passing.
- **Git: two commits exist on `main`**, both pushed and live at
  **https://grounded-rag-six.vercel.app** (`ArielMagalsoDev/provenance`, public):
  the original base build, then a second commit covering the Provenance ticket
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
| GitHub | `ArielMagalsoDev/provenance` (renamed 2026-08-08 from `grounded-rag`; local `origin` remote updated to match), public, `main` branch, connected to Vercel for auto-deploy-on-push |
| Vercel | project `ariel-m-projects/grounded-rag` (Vercel project itself not renamed — no rename tool available; irrelevant to visitors now) → primary domain **`https://provenance.arielmagalso.com`** (added 2026-08-08, CNAME on Hostinger, real Cloudflare Turnstile hostname added to match); old `https://grounded-rag-six.vercel.app` alias still works too |
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
(Provenance ticket contract, via `lib/tickets.ts`'s `runTicket` which wraps
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
  spacing, radii, component shapes) applied to Provenance's own content.
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
TURNSTILE_SECRET_KEY            # real Cloudflare secret key — see correction below
NEXT_PUBLIC_TURNSTILE_SITE_KEY  # real Cloudflare site key — see correction below
GROUNDEDNESS_THRESHOLD=0.70
GROUNDEDNESS_MIN_CLAIM_SCORE=0.40
RETRIEVAL_K=4
DAILY_SPEND_CAP_USD=5
RATE_LIMIT_PER_HOUR=10
WORKSPACE_TTL_MINUTES=30         # optional, defaults to 30 if unset — Agent Inbox / upload overlay retention
```

**Correction (2026-08-08):** this section and the "Outstanding" item below both said
Turnstile was still on Cloudflare's published test keys — stale. Verified live on
production: the site key actually served in the built JS bundle is
`0x4AAAAAAEJFxJ7d1Sx4I8VQ` — real Cloudflare format (`0x4AAAAAA...`), not the test
key's `1x0000...AA`. The matching secret key must be real too, not just the public site
key — a mismatched real/test pair would fail `verifyTurnstile`'s siteverify call, and
every real submission tested this session passed screening. This also explains an
earlier-session puzzle: a random preview-deployment `*.vercel.app` URL threw Turnstile
error 110200 (sitekey/domain mismatch) while the real `grounded-rag-six.vercel.app`
domain worked fine — expected behavior for a domain-restricted real key, not a bug.
Same values are set on Vercel for `production` + `preview` environments (`vercel env
add` during an earlier deploy).

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

## Update: PDF upload bug fixed, corpus content recovered (2026-08-07/08, session on Ariel's Mac)

A new session picked this up on Ariel's Mac (not the Windows box referenced above —
this repo was freshly cloned from GitHub there; see `PLAN-grounded-rag.md` for the
full narrative). Found and fixed two real bugs while finally testing real PDF upload
end-to-end (only `.md` had been exercised before):

- **Supabase project had auto-paused** (free-tier inactivity) — broke `/api/inbox` and
  `/api/workspace/upload` with generic `TypeError: fetch failed`. Restored (had to pause
  `signaldesk` first — the org's free tier caps 2 active projects; `signaldesk` is still
  paused, un-pause anytime, no data loss).
- **The real PDF upload bug was never `unpdf`.** It was `splitIntoSections()` in
  `lib/chunk.ts` silently dropping all content from any document with no `## ` headings
  and no blank lines — exactly what raw PDF-extracted text looks like (confirmed via
  temporary production diagnostic logging: extraction always succeeded; a downstream
  `chunkDocument()` call returning zero chunks was reusing the same `"no_text"` error
  code, masking the real cause). An earlier `serverExternalPackages: ["unpdf"]`
  next.config.ts change (commit `d458f8c`) was a red herring — harmless, kept as
  defensive practice, but not the fix. Real fix: commits `fbf83a3` + `cbc9d65` — the
  second commit specifically reorders so recovered leading content becomes a new
  *trailing* passage ID instead of shifting every existing one down (see that commit's
  message for why this mattered).
- **This recovered real corpus content**: `pricing.md`'s intro paragraph ("no
  long-term contract... cancel-anytime") had been silently dropped by the same bug
  since Phase 2. Verified end-to-end on production: uploaded a fresh test PDF → 200 OK
  → asked about it → answered correctly citing the uploaded passage, groundedness 1.0
  → confirmed a coverage-gap question (insurance) still correctly refuses → confirmed a
  normal corpus question still answers correctly.
- **The corpus-side fix was applied directly via SQL, not `npm run ingest`** — no
  machine in that session had `.env.local`'s real keys. Got the embedding straight from
  the deployed edge function (using the safe, publishable anon key — `embed`'s own
  comment confirms anon or service_role both work), then inserted the single new
  `pricing-08` row via Supabase MCP's `execute_sql` (which has its own elevated
  project-level access, separate from the app's service-role key). Verified: all 7
  existing `pricing-*` rows byte-identical, `pricing-08` retrieves correctly (0.86
  similarity) and cites correctly in production. **If a future session runs `npm run
  ingest` for any other reason, it will independently reproduce this exact same
  `pricing-08` row from the already-fixed `lib/chunk.ts` — nothing further needed
  there.**
- **`response_cache` was NOT truncated** despite the standing gotcha (#8) to do so
  after any corpus change — checked all cached rows individually first; none touch
  contract/cancel-anytime content, so nothing needed invalidating, and truncating
  would have removed the pre-warmed guided-scenario safety net with no way to rebuild
  it (no `ANTHROPIC_API_KEY` available that session). If a future session *can* run
  `npm run warm-cache`, doing so is still harmless cleanup, just not urgent.
- **New gotcha (19): Supabase's `list_tables` row counts are unreliable right after a
  project pause/restore** — it showed `passages: 0 rows` when the real count (verified
  via `execute_sql SELECT count(*)`) was 53. It's a `pg_class.reltuples` statistics
  estimate, not a live count, and doesn't refresh until the next autovacuum/analyze.
  Don't trust it immediately after restoring a paused project — query directly instead.

## Update: Product renamed "Meridian Assist" → "Provenance" (2026-08-08)

Ariel didn't like "Meridian Assist" as the product name (it borrowed too heavily from
"Meridian Nine," the fictional *client* company the corpus is about — confusing, since
the product and its fictional customer shouldn't share a name). Picked "Provenance"
instead — ties directly to the actual mechanic (every answer traces back to a source
passage) rather than being a generic "AI assistant" name. Renamed everywhere in one
pass:

- **All 38 in-repo occurrences** of "Meridian Assist" — nav/footer brand text, every
  page `<title>`/meta description, hero copy, code comments, doc references (this
  file, `docs/PRODUCT-PLAN.md`, eval case notes) — replaced with "Provenance".
  "Meridian Nine" (the unrelated fictional client) correctly left untouched throughout
  (verified via `grep` before and after — 9 hits, unchanged).
- **`package.json`'s `"name"` field**: `"grounded-rag"` → `"provenance"`.
- **GitHub repo renamed**: `ArielMagalsoDev/grounded-rag` → `ArielMagalsoDev/provenance`
  (via `gh repo rename`; GitHub auto-redirects the old URL). Local `origin` remote
  updated to match. Footer's "Source code" link updated to the new URL.
- **Vercel project itself was NOT renamed** — no rename tool was available (not via
  MCP, not via dashboard automation). Stayed `ariel-m-projects/grounded-rag`
  internally. This turned out not to matter: see custom domain below.
- **Custom domain set up**: `provenance.arielmagalso.com`, added as a Vercel domain
  (Production environment), CNAME added on Hostinger (`arielmagalso.com`'s existing
  DNS — Ariel's portfolio's own host, unaffected by this addition), SSL auto-issued by
  Vercel within a couple minutes. Once a custom domain is primary, the underlying
  Vercel project's internal `.vercel.app` name is invisible to visitors — so not being
  able to rename the Vercel project doesn't actually matter for branding.
- **Cloudflare Turnstile**: Ariel added `provenance.arielmagalso.com` as an allowed
  hostname on the existing widget (site key `0x4AAAAAAEJFxJ7d1Sx4I8VQ`) — required,
  since real Turnstile is domain-restricted (confirmed earlier this same session) and
  would otherwise reject submissions from the new domain with a sitekey/domain
  mismatch, same as the `110200` error hit earlier on an unregistered preview URL.

**One real slip this session**: the rename's file edits sat uncommitted locally for a
while (got sidetracked into the domain/DNS setup mid-task) — the live site kept
serving the old "Meridian Assist" title even after the domain was already resolving,
until this was caught by literally curling the new domain's `<title>` tag and seeing
the stale name. Lesson: after a rename like this, verify the *deployed* output, not
just that the local build compiled — a clean `npm run build` proves the code is
correct, not that it shipped.

## Update: Slack integration built — first real downstream connector (2026-08-08)

Ariel asked what it'd take to prove the automation is real rather than simulated —
landed on Slack over a CRM (HubSpot) specifically for demo value: a message visibly
posts to a channel in real time, and `human_review` tickets get clickable
Approve/Reject buttons a human can press *in Slack* that resolve the ticket for real.
Full design in `docs/PLAN-slack-integration.md`. **Phases 0–4 built this session,
Phase 5 (deploy + E2E verify) not started** — needs Ariel's go per the standing rule,
and the interactive buttons can only be verified once `/api/slack/interact` is live
(Slack's Request URL can't target localhost).

**Built:** `lib/slack.ts` (Block Kit posting, HMAC signature verification,
message-update-on-resolve, all fire-and-forget — Slack can never break the pipeline);
migration adding `slack_channel`/`slack_ts` to `tickets`; `runTicket` posts on every
ticket outcome and appends a real `notification` audit event; `resolveTicket` gained
a `source` (`inbox`/`slack`) param and updates the Slack message in place after either
side resolves; new `/api/slack/interact` route (signature-verified, idempotent via
the existing `already_resolved` guard); UI truthfulness pass (`/demo`'s disclaimer,
`/architecture`'s stage description) — customer-facing send/escalate stays simulated,
the Slack notification is real when configured.

**Real design gap caught and fixed while building, not after:** the first draft of
`updateTicketMessage` replaced a resolved ticket's Slack message with just a status
line ("Approved via Slack"), silently deleting the original question/answer/reason
context — the code's own comment even claimed the opposite of what it did. Caught by
actually re-reading the diff rather than trusting the docstring. Fixed by extracting
a shared `buildInfoBlocks` helper so both the initial post and the resolve-time update
render from the same source, with the status line appended, not swapped in.

**Also worth knowing:** a Slack click carries no browser cookie, so `resolveTicket`
can't use the existing "operator's own workspace" logic `/inbox` relies on
(`ensureWorkspaceId`). Slack approvals fall back to the *ticket's own* `workspace_id`
(benefits the original filer) or mint a fresh UUID for anonymous/shared tickets
(mirrors what `/inbox` already does for a cookie-less request) — computed inline in
`resolveTicket`, zero behavior change for the existing `/inbox` path.

**Not yet done (Phase 5):** commit + push, deploy, then E2E verify against production
— post an approved/human_review/blocked ticket and confirm the Slack messages look
right, click Approve/Reject in Slack and confirm the ticket resolves + the learned
passage lands + the cached refusal clears + the message updates in place, confirm a
second click on the same button is a safe no-op, confirm `npm run evals` is still
45/45 (should be — evals call the pipeline directly, never touch the ticket layer at
all, so this is expected to be a non-issue, not something guessed at).

**One credential-hygiene note for next session:** Ariel pasted a bot token, an
app-level token, and the signing secret directly into chat this session while working
through Slack's setup UI. Flagged each time and asked him to rotate — worth
double-checking that actually happened before assuming the values now in Vercel are
the post-rotation ones, since this session never saw whether he rotated before or
after entering the final values.

## Outstanding decisions / next actions

1. ~~Say go to commit + push the Agent Inbox / upload work~~ — done, see above; also
   done: the PDF upload fix and the `pricing.md` recovery in this same update.
2. **Refusal screenshot for the README** (`docs/refusal-screenshot.png`) — still never
   actually captured to disk; ask a question the corpus doesn't cover (e.g. parking)
   on `/demo` and screenshot the resulting panel.
3. ~~Real Cloudflare Turnstile account~~ — **already done**, this doc was stale. Verified
   live 2026-08-08: production serves a real Cloudflare site key
   (`0x4AAAAAAEJFxJ7d1Sx4I8VQ`), not the published test key. See the correction under
   "Env vars" above.
4. ~~Custom domain~~ — **done 2026-08-08**: `provenance.arielmagalso.com` is live
   (CNAME added on Hostinger, points to Vercel; SSL auto-issued; real Cloudflare
   Turnstile hostname added to match). Product renamed to "Provenance" the same
   session (see the rename note near the top of this file), which is why this landed
   on `provenance.` rather than the earlier `rag.`/`assist.` candidates.
5. **`docs/PRODUCT-PLAN.md` Phases 3-5** — a held-out eval set (the current
   100%/0%/0% is a dev-set number the pipeline was iterated against directly — not
   proof it generalizes) and a walkthrough video are still unbuilt. The "real
   external integration (webhook intake, one downstream connector)" piece is now
   partially done — see the Slack integration below — pending its own deploy/verify.
6. **Full eval suite hasn't been re-run since the corpus grew to 52 passages** — the
   committed 100%/0%/0% scorecard predates `pricing-08`. Very unlikely to regress
   anything (the new passage only makes a previously-unanswerable-by-that-exact-passage
   question answerable — it was already being answered adequately by neighboring
   passages like `pricing-07`), but worth a real `npm run evals` run next time a
   machine has the real keys, both for that and to confirm nothing else drifted.
7. **`signaldesk`'s Supabase project is paused** (traded for the restore above) — 
   un-pause whenever that project is needed again; no data was lost.
8. **Slack integration (Phases 0–4) is built but not deployed or E2E-verified** — see
   the Slack update above and `docs/PLAN-slack-integration.md`'s status section. Say
   go to commit + push once ready; then verify the Approve/Reject buttons live,
   since they can't be tested against localhost.
