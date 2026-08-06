# Meridian Assist — Business Automation Product Plan (fine-tuned 2026-08-06)

Evolution of the grounded-rag portfolio demo into a business-first product story.
This is the working plan; deltas vs the original draft are marked **[AMENDED]** with
the reasoning inline. Repo stays `grounded-rag`; "Meridian Assist" is the product
presentation layer on top of it.

---

## 1. Product summary

Meridian Assist is an auditable customer-support automation for coworking and
flexible-office operators. It answers routine questions from approved policy documents,
cites the evidence behind every response, blocks unsafe instructions, and sends
uncertain or unsupported requests to a human.

The portfolio story is not "a chatbot that uses RAG." It is:

> Meridian Assist reduces repetitive support work without allowing AI to invent
> company policy.

## 2. Target business and buyer

Unchanged from draft: multi-location coworking / serviced-office / flexible-office
operators. Buyer: Head of Operations, Support Manager, Community Ops Director, COO of
a small-to-mid workspace operator. End users: front-desk staff, support agents,
members, ops managers.

## 3. Business problem

Unchanged from draft: repetitive policy questions consume staff time and produce
inconsistent answers across locations; a generic chatbot adds fabrication risk exactly
where it's most dangerous (refunds, contracts, insurance, accessibility, billing,
access control). Meridian Assist resolves the well-supported portion automatically,
cites its evidence, and escalates the rest with an audit trail.

## 4. Product promise

Primary: **resolve routine support questions without inventing company policy.**

Supporting promises and explicit non-promises unchanged from draft, with one addition:

- **[AMENDED — addition]** "Every automated decision leaves an audit record" is a
  *product* promise; in the portfolio demo, audit events are real (persisted per
  request) but external sends are simulated and labeled as such. Don't let the demo
  imply real emails leave the building.

## 5. End-to-end automation story

Flow unchanged (ingest → screen → retrieve → draft → verify → route → audit). Three
terminal states: **approved response / human review / security block**.

**[AMENDED — mapping note]** These map onto the existing implementation as:
`answered` → approved, `refused` → human review, `blocked` → security block. The
pipeline itself already produces the right three states; what's new is the ticket
framing, routing reasons, and the audit record around them — presentation and
persistence, not a rebuild of the decision core.

## 6. Guided public demo

Three scenarios unchanged in intent. Implementation notes:

- **Scenario 1** ("Dedicated Desk cost + after-hours access") — deliberately
  multi-part; both claims resolve from real passages (`pricing-03` covers the price
  *and* 24/7 keycard access). Good test that multi-claim verification cites each part.
- **Scenario 2** (stolen-laptop insurance) — exercises the insurance near-miss
  documented in `corpus/COVERAGE.md`. Expected route: human review, with the retrieved
  liability passages attached as the handoff evidence.
- **Scenario 3** (injection + "private staff access code") — the current deny-list +
  classifier blocks this pre-retrieval. **[AMENDED]** Add this exact phrasing to the
  adversarial eval bucket so the guided scenario is itself a pinned regression test.
- **[AMENDED — cost note]** The three guided scenarios ride the existing pre-warmed
  cache (`npm run warm-cache`), so they cost $0 per click and survive the spend cap —
  the "prerecorded fallback" requirement is already how the budget-exhausted path
  works. Extend warm-cache to the exact scenario phrasings when they're finalized.

Public-demo safeguards unchanged; all already implemented (Turnstile, rate limit,
spend cap, cached fallback, no raw provider errors) except "friendly recovery state
for provider outage," which needs a small UI state.

## 7. Product experience

Pages: `/` business case, `/demo` guided workflow, `/evals`, `/corpus`,
`/architecture`. Unchanged, with two amendments:

- **[AMENDED]** The draft's Phase 1 references "the approved HTML mockup" — no such
  mockup exists yet. Replace with: produce a simple layout reference first (or design
  directly in code, consistent with the existing restrained/typographic style).
- **[AMENDED]** The existing `/` demo page becomes `/demo`; the new `/` is the
  business-case landing page. Keep old URLs redirecting so nothing shared breaks.

## 8. Business-impact model

Unchanged: interactive calculator with clearly-labeled illustrative inputs (600
tickets/mo, 45% automation-eligible, 9.3 min saved, ~42 staff-hours returned, 18%
review rate). Every figure labeled "illustrative, not measured." No invented customer
results, ever.

## 9. Reliability and safety plan

**[AMENDED — this section was stale and is rewritten]**

### Current evidence (as of 2026-08-06, committed in `evals/results.md`)

| Category | Cases | Accuracy | Fabrication rate |
| --- | ---: | ---: | ---: |
| Answerable | 20 | 100.0% | 0.0% |
| Unanswerable | 12 | 100.0% | 0.0% |
| Adversarial | 8 | 100.0% | 0.0% |
| Overall | 40 | 100.0% | 0.0% |

The draft's 33.3% unanswerable-fabrication figure was real but is from an earlier
build. Two fixes closed it: (1) generation no longer writes prose about what the
passages don't cover, and claim decomposition explicitly excludes meta-commentary —
"the docs don't mention X" was previously scored as a trivially-true supported claim;
(2) citations are now derived from the verifier's per-claim supported evidence, not
the generator's self-report.

### Primary reliability blocker (reframed)

**A perfect score on the 40-case development set is not production evidence — it's the
set we tuned against.** The honest public framing is: "0% fabrication on the
development set; held-out evaluation pending." The central engineering objective is no
longer fixing a known fabrication bug; it is proving the fix generalizes.

### Remediation sequence (updated for what's already done)

1. ~~Claim-level entailment against cited passages~~ — **done** (`lib/ground.ts`).
2. ~~Reject citations that are merely topically similar~~ — **done**
   (`deriveCitations()` uses verified support only).
3. ~~Default uncertain decisions to human review~~ — **done** (mean + min-claim gate
   fails closed).
4. Build a **held-out evaluation set** (≥40 new cases) the pipeline has never been
   tuned against: paraphrases of existing cases, multi-part questions with mixed
   support, contradiction probes, and a few multilingual variants. Version it
   separately from the dev set; never tune on it.
5. Calibrate thresholds on the held-out set, not the presentation set. (The current
   sweep shows 0%/0% at every threshold 0.5–0.8 because post-fix scores are bimodal —
   nearly all 1.00 or 0.00. Mixed-support questions are what will make the sweep
   informative.)
6. Consider an explicit evidence-sufficiency classifier separate from generation —
   **only if** the held-out set shows the current gate leaking. Don't add a component
   the evidence doesn't yet call for.

### Target acceptance thresholds (before presenting auto-send as production-ready)

- Fabrication rate on the **held-out** unanswerable set: below 5%
- Answerable accuracy on the held-out set: at least 90%
- Adversarial blocking: at least 95%
- Every auto-sent material claim has a verifier-confirmed citation (structurally
  guaranteed by `deriveCitations`, but assert it in evals anyway)
- Guided demo success rate: 100%, including the cached-fallback path

## 10. Integration story

Unchanged in direction: one believable end-to-end handoff beats several unfinished
connectors. First integration = simulated support inbox + a real webhook-shaped
`/api/tickets` endpoint.

**[AMENDED — implementation constraints]**
- The webhook input must be **idempotent** (the test plan requires repeated delivery
  to not duplicate replies/tickets): require an `id` on `SupportTicket` and upsert on
  it.
- The webhook endpoint is NOT on the anonymous demo path — it requires a configured
  shared secret. Anonymous users get the guided inbox only.
- Real third-party integrations (Zendesk/Slack/etc.) stay out of scope until Phase 4,
  and even then one only, in a dev workspace.

## 11. Technical interfaces

Contracts as drafted (`SupportTicket`, `AutomationDecision`, `Citation`,
`ReviewHandoff`), with amendments:

- **[AMENDED]** `AutomationDecision` **wraps** the existing `AskResponse`, it does not
  replace it. `AskResponse` remains the internal pipeline contract (it's what the
  pipeline panel renders); the ticket layer maps it to `AutomationDecision` and adds
  routing reason + audit events. Changing the internal contract would churn every
  verified component for no decision-quality gain.
- **[AMENDED]** `Citation.documentVersion` requires document versioning that doesn't
  exist yet. Cheapest honest implementation: stamp each ingest run with the corpus
  content hash (or git commit once the repo has history) into a `corpus_version`
  column on `passages`, and surface that. Full per-document version history is out of
  scope.
- **[AMENDED]** Audit events need a new `audit_events` table (append-only:
  ticket id, stage, outcome, reason, timestamps). This also requires consciously
  amending the repo `CLAUDE.md`'s out-of-scope list, which currently excludes
  admin-dashboard-like features — the audit *record* is in scope; an audit *browsing
  UI beyond the per-ticket history* stays out.

## 12. Implementation roadmap

**[AMENDED — added Phase 0; resequenced Phase 3 for work already done]**

### Phase 0 — Ship what exists (prerequisite the draft skips)

The current build is verified locally but not deployed, not in git, and has test
Turnstile keys. Repositioning an undeployed app puts polish before existence.
- Git init, initial commits, push to `ArielMagalsoDev/grounded-rag`
- Deploy to Vercel, wire env vars, real Turnstile keys, warm cache, verify spend cap
  on the deployed URL

**Acceptance:** the current demo works at a public URL with all safeguards live.

### Phase 1 — Reposition as Meridian Assist

As drafted (business-first landing page, guided-demo entry, corpus/evals preserved,
no internal dev notes on public pages) minus the nonexistent "approved HTML mockup"
reference — design in code against the existing restrained style.

**Acceptance:** a non-technical operations manager can explain the problem, outcome,
and safety model after the first screen and guided demo.

### Phase 2 — Operational demo (guided inbox)

As drafted: three-column support-workflow UI, three guided scenarios, simulated
reply/escalation actions, evidence + claim checks + routing reason + audit history
rendered per ticket. Guided scenarios keep working during outages via the existing
cache path.

**Acceptance:** all three scenarios reach their expected outcome without signup,
external side effects, or exposed infrastructure errors.

### Phase 3 — Prove reliability generalizes

**[AMENDED]** The draft's Phase 3 assumed the fabrication bug was still open; most of
its items are done. Re-scoped to: build the held-out eval set (§9 item 4), calibrate
on it (§9 item 5), track accuracy/fabrication/false-refusal/latency/cost per category
across both sets, and publish both dev-set and held-out results side by side.

**Acceptance:** held-out fabrication < 5% with held-out answerable accuracy ≥ 90% —
or, if it fails, the failure analysis is published and auto-send stays labeled
not-production-ready. Either outcome is acceptable portfolio material; hiding the
number is not.

### Phase 4 — End-to-end automation handoff

As drafted (webhook ticket input, one real integration in a dev environment, review
tickets with evidence, audited external actions) plus the idempotency and
shared-secret constraints from §10.

**Acceptance:** a test ticket travels intake → approved reply or assigned review with
traceable identifiers; replayed webhook deliveries produce no duplicates.

### Phase 5 — Package as hiring proof

As drafted: stable hosted demo, architecture page, 60–90s walkthrough video,
responsibilities/choices/failures write-up, GitHub + contact CTAs, limitations
displayed prominently.

**Acceptance:** demonstrates product thinking, automation design, reliability
engineering, evaluation, and operational integration — not only prompt engineering.

## 13. Test plan

As drafted, with additions:
- **[AMENDED]** Pin all three guided-scenario phrasings into the eval suite (exact
  strings), so a prompt or corpus change that breaks a scenario fails `npm run evals`
  before it reaches the demo.
- **[AMENDED]** Add a cache-integrity check: after any corpus change, `warm-cache`
  must be re-run and stale cached responses invalidated (cache is keyed on question
  text and does not auto-invalidate on corpus changes — bit us once already).

## 14. Portfolio presentation

As drafted (pages, portfolio statement, hiring signals). One naming decision:

- **[AMENDED — decision needed]** URL. Options: keep `rag.arielmagalso.com` (already
  planned, technical-sounding) or move to `assist.arielmagalso.com` (matches the
  product story). Recommendation: **assist.arielmagalso.com** as primary once Phase 1
  ships, since the whole point of the repositioning is business-first framing; keep
  the repo named grounded-rag.

## 15. Definition of done

As drafted, with the reliability line updated to match §9: held-out fabrication below
5% **or** auto-send explicitly labeled not-production-ready for that class — the
transparency is the requirement, not the number.
