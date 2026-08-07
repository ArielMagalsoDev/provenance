# PLAN — Surface the Slack integration in the demo UI

Planned 2026-08-08, right after the Slack connector itself was verified live
(docs/PLAN-slack-integration.md). Problem: the integration currently announces
itself in the demo as one grey audit-trail row ("Operator notified — posted").
A 90-second recruiter will never notice that line, so the single most
impressive fact about the demo — *it does something real, outside itself* — is
effectively invisible. This plan makes it unmissable without overclaiming.

## Principles (carried over from everything else in this repo)

1. **Truthful rendering only.** The Slack card renders only when a
   `notification` audit event actually exists on the decision — i.e. only when
   a real message really landed in the channel. Slack unconfigured or the post
   failed → the card simply doesn't appear, no fake "would have posted" state.
2. **No Slack logo assets.** Slack's brand kit has usage rules and adding a
   trademarked asset to a portfolio repo is pointless risk. The mock uses
   text ("Slack", `#provenance-ops`), Slack-*style* message chrome (bot avatar
   square, app badge, timestamp) built from the existing design tokens — a
   recognizable homage, not a copied logo.
3. **The demo UI never talks to Slack.** Everything the card renders is
   already in the `AutomationDecision` the client holds (question, answer,
   reason, citations, groundedness, outcome, audit events). Zero new API
   calls, zero client-side Slack anything, no new env exposure.
4. **Buttons in the mock are decorative.** The real Approve/Reject buttons
   live in Slack. The mock shows them (on human_review) with a caption saying
   exactly that — "these buttons are live in the real channel" — because
   pretending the mock is clickable would be a lie, and hiding them would
   undersell the feature.

## Build phases

### Phase 1 — `SlackNotificationCard` component (the centerpiece)
`app/components/SlackNotificationCard.tsx`, rendered inside
`TicketWorkflow`'s decision column when (and only when) the decision's
`auditEvents` contain a `notification` event.

A faux-Slack message card:
- Header row: mono label `POSTED TO SLACK · #provenance-ops` + a "Real, not
  simulated" badge (reuse the existing `success` badge variant).
- Message body styled like a Slack message: square gradient avatar (reuse
  `.brand-mark`), "Provenance" + `APP` chip + timestamp, then the same
  content the real Block Kit message carries — outcome line, question,
  answer/reason, citations + groundedness context line.
- On `human_review`: decorative Approve/Reject pill buttons + caption
  "Live buttons in the actual channel — an operator can resolve this ticket
  from Slack, and the message updates in place."
- Content comes from a shared client-safe formatter. `lib/slack.ts` is
  server-only (reads env, node:crypto) — do NOT import it client-side.
  Either duplicate the tiny outcome→copy mapping in the component (it's
  ~15 lines) or lift `TicketSlackSummary` building into the component from
  the decision it already receives. No refactor of lib/slack.ts needed.

### Phase 2 — landing page (`app/page.tsx`)
- The 7-step "How it works" strip: step 6 "Reply or route" copy gains the
  Slack handoff ("Send safely, post to Slack, or involve staff") — smallest
  honest edit, no new step.
- "What was built" dark mega-card: add a fifth SYSTEM card — "SYSTEM / 05 —
  Live operations handoff: every decision posts to a real Slack channel;
  escalations carry live Approve/Reject buttons an operator can act on."
  (Grid is `repeat`-based — check the mobile collapse classes still hold at
  5 items; gotcha 15's `minmax(0, Nfr)` utilities already exist.)
- Stat strip: while touching this file, fix the stale hardcoded "51 indexed
  passages" → 52 (flagged earlier this session, never fixed).

### Phase 3 — `/architecture` page
Add the connector to the flow description: a short "Downstream: Slack"
subsection after routing — post on every outcome, signature-verified
interactive callback, resolution updates the message in place. Mention
`/api/slack/interact` by name; reviewers read this page.

### Phase 4 — `/inbox` badge
Tickets that were posted to Slack get a small "Also in Slack" badge, so the
inbox and the channel visibly describe the same queue. Needs `slack_ts`
exposed on `InboxTicketRow` (the DB row already carries it — one field in
`rowToTicket`, no schema change). Resolved-from-Slack tickets already show
their source via the resolution jsonb; render "Resolved via Slack" where the
inbox shows resolution state.

### Phase 5 — verify + ship
- `npm run build` clean; check the card renders for approved AND
  human_review, and does NOT render when the notification event is absent
  (easy local check: env vars unset locally → no event → no card).
- Mobile pass at 375px (gotcha 15 applies to any new grid).
- Commit + push on Ariel's go; verify live on provenance.arielmagalso.com
  with a real ticket submission (bearing in mind Turnstile now blocks
  automation — the network-response JSON check still works from a fresh
  page load, same technique as this session's earlier verifications).

## Out of scope (deliberately)

- Live-reading the Slack channel from the UI (would need a client-exposed
  token or a proxy endpoint — real attack surface for zero demo value).
- Screenshots of the real Slack workspace embedded as images (go stale
  instantly, and the CSS mock demonstrates the same thing honestly).
- A "connected/disconnected" Slack status indicator on the landing page
  (leaks operational detail; the per-ticket card already proves liveness).

## Estimated effort

One focused session, Phase 1 being most of it. No migrations, no new
dependencies, no API changes — presentation layer only, pipeline untouched.
