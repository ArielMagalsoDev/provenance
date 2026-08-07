# Plan — Agent Inbox (HITL feedback) + Custom Knowledge Upload

Status: PLANNED, not started. Written 2026-08-07 against commit `7e0532a`.

## Context

Two features requested for the Meridian Assist demo:

1. **Human-in-the-Loop Agent Inbox** — an operator surface listing escalated
   (`human_review`) tickets where a human can read the evidence, edit the AI's
   proposed response, click Approve, and have the corrected answer fed back into
   the corpus so the next similar question answers automatically.
2. **Custom Knowledge Upload** — a visitor drops their own PDF/Markdown file and
   runs the same verification/routing pipeline against *their* document in real
   time.

These correspond to `docs/PRODUCT-PLAN.md`'s "real integration" ambitions but are
scoped as demo-grade portfolio features, not production multi-tenancy.

## The unifying design decision: session workspaces (overlay model)

Both features need somewhere to write per-visitor corpus content without
polluting the shared Meridian Nine corpus:

- The inbox's "feed the corrected answer back" is an **anonymous public demo**
  (non-negotiable #5: no signup/login). Writing visitor-approved text into the
  *shared* corpus is a corpus-poisoning vector — one visitor could plant an
  answer every later visitor retrieves.
- The upload feature needs per-visitor documents by definition.

So: one mechanism serves both. Each visitor gets a **workspace** (random UUID,
minted server-side on first write, held in a cookie). Corpus content layers:

- **Shared corpus** (existing 51 passages): `workspace_id = NULL`. Read-only.
- **Workspace overlay**: passages with `workspace_id = <visitor's uuid>` —
  either *learned* (approved from the inbox) or *uploaded* (from a file).

Retrieval searches `workspace_id IS NULL OR workspace_id = :ws`. Your
corrections and uploads affect **your** future answers only. This is also the
honest demo story: "in production this would be your company's tenant."

An uploaded-docs workspace can optionally *exclude* the shared corpus (a
"my docs only" toggle) so visitors can test purely against their own file.

### Isolation: per-browser cookie, deliberately not per-IP

The workspace id is a random UUID minted server-side, set as an `httpOnly`,
`Secure`, `SameSite=Lax` cookie (unreadable/unforgeable from client JS; the
client learns workspace state — passage count, expiry — via API responses,
never by reading the cookie itself). This is the **only** signal used to
decide whose upload/correction a request can see.

IP is deliberately *not* used for isolation, even though it's tempting for a
demo: real IPs are shared constantly — an office, a café, a university, or a
mobile carrier's CGNAT can put dozens of unrelated visitors behind one public
IP. Keying isolation off IP would mean two strangers on the same café WiFi
could see each other's uploaded file, which is worse than what we're trying
to avoid. IP hash (`hashIp`, already used by rate limiting) stays scoped to
abuse prevention only — workspace creation rate is throttled per IP so one
visitor can't mint hundreds of workspaces, but content visibility never keys
off it.

Real consequence to state on the UI: clearing cookies or switching browsers/
devices starts a new, empty workspace. That's expected session-scoped
behavior for a demo, not a bug — same as any other per-browser web app state.

## Feature 1 — Agent Inbox

### Data

New migration `tickets` table (tickets are currently ephemeral — only
`audit_events` persists; the inbox needs to list and reopen them):

```sql
create table tickets (
  id uuid primary key,
  workspace_id uuid null,          -- null = shared-demo ticket
  channel text not null,
  customer_name text not null,
  customer_context text,
  category text not null,
  message text not null,
  outcome text not null,           -- approved | human_review | blocked
  reason text not null,
  proposed_response text,
  citations jsonb not null default '[]',
  groundedness numeric,
  status text not null default 'open',   -- open | resolved
  resolution jsonb,                -- {action, editedResponse, resolvedAt}
  created_at timestamptz not null default now()
);
-- RLS locked to service_role, same as every other table (see migration 5 pattern).
```

New migration: add `workspace_id uuid null` + `origin text not null default
'corpus'` (`corpus | learned | uploaded`) columns to `passages`; extend
`match_passages` with `p_workspace uuid default null, p_include_shared boolean
default true` filtering as above. Existing rows untouched (`workspace_id` null,
origin 'corpus'). Index on `workspace_id`. Exact scan stays correct at this
scale (see the no-ivfflat note).

`lib/tickets.ts` `runTicket()` additionally INSERTs the ticket row (status
`open` for human_review, `resolved` for approved/blocked — only escalations
need inbox action).

### API

- `GET /api/inbox` — list `human_review` tickets, newest first, capped (e.g.
  25). Returns ticket + decision fields needed by the UI. Scoped: shared-demo
  tickets plus the caller's workspace tickets.
- `POST /api/inbox/resolve` — body `{ticketId, action: "approve" |
  "dismiss", editedResponse}`. On **approve**:
  1. Screen `editedResponse` through the existing deny-list (cheap, no model
     call) — an operator correction is trusted *content* but still shouldn't
     carry injection strings into future generation contexts.
  2. Embed it (existing `embedTexts`) and upsert a passage:
     `id = learned-<ticketId8>`, `origin = 'learned'`,
     `workspace_id = <caller's workspace>`, heading = the ticket question,
     content = "Q: <question>\nA (operator-approved): <editedResponse>".
  3. Delete the `response_cache` row for that question's hash (gotcha #8: the
     cache never auto-invalidates; without this the OLD refusal keeps serving
     for 24h and the demo looks broken).
  4. Mark the ticket `resolved`, write an `action` audit event
     (`operator_approved`, real — not simulated; the corpus write actually
     happened).
- Both endpoints: same Turnstile + rate-limit guards as `/api/tickets`.
  Workspace overlay capped at ~40 learned+uploaded passages; approve returns
  `workspace_full` beyond that.

### UI — `/inbox`

New page, Salix-styled like `/demo` (reuse `.card-feature`, badge pills,
`.btn-glow-wrap`):

- Left: queue list (amber-badged escalations; ticket message, reason snippet,
  time). Empty state points at `/demo` scenario 02 to generate one.
- Right: selected ticket detail — reason, retrieved evidence (reuse
  `EvidenceSteps` data shapes), claim checks, and an **editable textarea**
  seeded with `proposedResponse` (often empty for refusals — placeholder
  invites the operator to write the answer, which is the real workflow).
- Buttons: **Approve & teach** (dark pill + glow — this is the commit moment)
  and **Dismiss**. After approve: confirmation card with a one-click "Ask the
  same question again" that re-runs the ticket — now answered, citing the
  `learned-*` passage. That replay is the money shot of the whole feature.
- Learned citations render with a distinct "Operator-approved" badge in
  `DecisionPanel`/citation chips (documentTitle = "Operator approved",
  documentVersion = `learned-<date>`), so provenance is visible — this demo's
  whole thesis is provenance.
- Nav: add "Inbox" link with an open-count badge.

### Pipeline changes

- `runAskPipeline(question, ..., workspace?: {id, includeShared})` — passes
  workspace through to `retrieve()` → `match_passages`.
- Cache keying (critical): `hashQuestion` currently keys on question text
  alone. A workspace hit must not poison the shared cache and vice versa. Key
  becomes `hash((workspaceKeyPart ?? "") + normalized question)` where
  `workspaceKeyPart` is set only when the workspace actually has overlay
  passages (one cheap count, cacheable per request). Pre-warmed scenario
  cache entries keep working for overlay-less visitors unchanged.
- Cache TTL for a workspace-scoped hit is **the same short expiry as the
  overlay content itself** (see Retention below), not the global 24h — a
  cached answer that cites an uploaded passage must not outlive that
  passage, or the visitor gets a "correct-looking" answer citing a document
  that's already gone.

## Feature 2 — Custom Knowledge Upload

### Parsing + chunking

- Extract the section/paragraph chunker out of `scripts/ingest.ts` into
  `lib/chunk.ts` (pure functions, no fs) — the script and the upload route
  share one chunking implementation instead of two drifting copies.
- Markdown/.txt: read as text, chunk directly. **PDF**: add `unpdf`
  (serverless-friendly PDF text extraction, no native binaries — the stated
  reason CLAUDE.md's no-new-dependencies rule requires; hand-rolling PDF
  extraction is not realistic). Extract per-page text → join → chunk.
  Scanned/image-only PDFs yield ~no text → friendly error ("this PDF has no
  extractable text"), not a silent empty corpus.

### API

- `POST /api/workspace/upload` — multipart or base64 body. Guards, in order:
  Turnstile → rate limit (uploads also count) → size cap **2 MB / ~40 pages /
  ~120k chars extracted** → chunk (cap 40 passages, else "document too large
  for the demo") → embed via existing `embedTexts` fan-out (free) → upsert
  with `origin='uploaded'`, `workspace_id`, ids `up-<hash8>-NN`. Mints the
  workspace cookie if absent. Returns passage count + headings preview.
  Embedding is $0 (Supabase gte-small) so uploads don't touch the spend cap;
  asking questions afterwards costs the same as today and stays inside the
  existing rate limit + cap.
- `POST /api/workspace/clear` — deletes the caller's overlay passages +
  cached responses; also called by a "Remove my document" button.
- **Retention: 30 minutes** (`WORKSPACE_TTL_MINUTES` env var, default `30`,
  same shape as the existing tunables in `lib/limit.ts` — 15 is one env-var
  flip if preferred). Applies to the whole overlay, learned passages included:
  the inbox replay is a live within-session demo, so one TTL for both keeps
  the mechanism single-purpose instead of two retention policies to reason
  about.
  - **Correctness comes from the read path, not a cleanup job**: `match_
    passages` filters workspace rows with
    `created_at > now() - interval '<TTL>'` in the query itself, so an
    expired passage stops being retrievable at exactly the TTL mark, with no
    dependency on a sweep having run recently. A lazy `delete ... where
    workspace_id = :ws and created_at < now() - interval '<TTL>'` still runs
    on every workspace write (upload/approve), purely to reclaim storage —
    it's cleanup, not the correctness mechanism.
  - Upload/approve responses include `expiresAt` (server time + TTL) so the
    client never computes expiry itself.

### Retention timer — UI

- Once a workspace has content, a small `.badge`-style countdown ("Expires in
  29:41") sits next to the "Remove my document" control, driven by a
  `setInterval` computed from the server's `expiresAt` — never a client-side
  guess. Under ~2 minutes it switches to `badge-critical` (pink) styling as a
  visible warning.
- On expiry (countdown hits 0, or any pipeline call reports the workspace is
  now empty): the upload card resets to its empty dropzone state with a plain
  "Your document expired after 30 minutes and was removed — upload it again
  to continue" message. If "my docs only" was on, expiry is treated the same
  as an empty result: the ticket routes to `human_review` with a specific
  reason string ("workspace expired") rather than a generic unsupported-
  question refusal — an expired upload shouldn't look like a grounding
  failure in the pipeline panel.

### UI — on `/demo`

- New "Use your own knowledge" card above the scenario picker: dropzone
  (drag/drop + file input, .md/.txt/.pdf), progress ("Extracting → Chunking →
  Indexing n/40"), then a summary chip row (file name, passage count,
  countdown timer, "My docs only" toggle, Remove button — see "Retention
  timer — UI" above for the countdown's behavior).
- While a workspace is active: scenario chips stay (shared corpus still
  searchable unless "my docs only"), the ticket form placeholder becomes "Ask
  about your document…", and citations from uploaded passages show the
  filename as documentTitle.
- The pipeline panel needs zero changes — retrieval/verification/routing
  render exactly as today, which is the point: same machinery, your data.

## Non-negotiables check

- #3 screening before paid calls: unchanged (workspace plumbing sits in
  retrieval, after screening).
- #4 spend cap: unchanged; uploads cost $0 in model terms.
- #5 no signup: workspace = anonymous cookie. No accounts.
- #6 evals: add 3-4 eval cases for the learned-passage path (approve a
  correction → same question now answers, citing `learned-*`; distinct
  question still refuses). Eval runner needs a small workspace fixture helper.

## Sequencing

1. **Migrations + retrieval plumbing** (workspace column, match_passages, ids
   through `retrieve`/`runAskPipeline`, cache keying) — foundation for both.
2. **Tickets table + persistence** in `runTicket`.
3. **Inbox API + `/inbox` UI + learned-passage approve loop** (feature 1
   complete, demoable end-to-end with scenario 02).
4. **`lib/chunk.ts` extraction + upload API + dropzone UI** (feature 2).
5. **Evals + docs**: new eval cases, README section, HANDOFF.md + PRODUCT-PLAN
   cross-reference, bump `CORPUS_VERSION` handling note.

Each step builds/verifies independently; 1-3 ship without 4.

## Verification

- `npm run build` + typecheck at each step.
- Browser: run scenario 02 → `/inbox` shows it → edit + approve → replay
  question → answered with `learned-*` citation → `npm run evals` still
  100%/0%/0% on the original 43 (shared corpus untouched by overlay writes).
- Upload a small .md → ask a question it answers (approved, cites filename) →
  ask one it doesn't (refused) → prompt-injection text inside an uploaded doc
  still gets blocked/refused (add this as a manual test at minimum).
- Cache checks: same question with and without workspace returns different,
  correctly-scoped answers; approve invalidates the stale refusal.
- Second browser/incognito: workspace isolation (my learned passage doesn't
  appear in your answers).

## Out of scope (explicitly)

- Real auth/roles for the inbox (it's a public demo persona, framed as such).
- Global/shared corpus writes from the inbox.
- DOCX/HTML uploads, OCR for scanned PDFs, >1 file per workspace.
- Real messaging/ticketing integration (still Phase 4 of PRODUCT-PLAN.md).
