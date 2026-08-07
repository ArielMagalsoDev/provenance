# PLAN — Slack integration (real downstream connector)

Planned 2026-08-08. This is the first *real* external integration — until now the
"send/escalate" action was explicitly simulated (the demo UI says so). Slack was
chosen over a CRM for demo value: a message visibly lands in a channel in real time,
and `human_review` tickets get a clickable **Approve / Reject** button that a human
can press *in Slack*, which resolves the ticket for real. This also closes part of
`docs/PRODUCT-PLAN.md` Phase 4 ("one real downstream connector").

## What it does

When a ticket finishes the pipeline (`/api/tickets`), the app posts to a Slack
channel:

| Outcome | Slack message |
|---|---|
| `approved` | The proposed response + citations + groundedness score, framed as "sent to customer" (the send itself stays simulated — Slack is the operator-facing notification) |
| `human_review` | The ticket, the reason routing failed, the draft (if any), and **Approve / Reject** buttons (Block Kit). Clicking calls back into the app and resolves the ticket exactly like the `/inbox` UI does |
| `blocked` | Compact one-line notice (attack/anomaly visibility), no buttons |

Approve from Slack = same effect as Approve in `/inbox`: the correction is embedded
as a `learned-*` passage in the **ticket's own workspace** and the stale cached
refusal is deleted. Reject = dismiss. After a click, the Slack message is updated
in place ("Resolved by @user — approved") so the channel shows a truthful audit
trail and double-clicks are visually discouraged.

## Non-negotiables carried over (do not compromise)

1. **Slack must never break the pipeline.** Posting is fire-and-forget with its own
   try/catch; a Slack outage or missing env vars degrades to exactly today's
   behavior (no post, pipeline unaffected). Same posture as `verifyTurnstile`'s
   fail-closed — except here we fail *open* because notification is an enhancement,
   not a gate.
2. **The webhook is signature-verified and idempotent** (PRODUCT-PLAN §amendments
   already requires this). Slack signing secret, HMAC-SHA256, timestamp within
   ±5 min. Replay or double-click on an already-resolved ticket → polite no-op
   (reuse `resolveTicket`'s existing `already_resolved` guard).
3. **Pipeline visibility (non-negotiable #1).** The Slack post becomes a real
   `audit_events` row (`stage: "notification"`, e.g. `posted to #provenance-ops`),
   so the pipeline panel and inbox show that the notification actually happened —
   nothing hidden, including the integration.
4. **No new dependencies.** Slack's Web API is plain HTTPS + JSON — use `fetch`,
   not `@slack/web-api` / `@slack/bolt`. Signature verification is `node:crypto`.
5. **No secrets in the repo.** Three new env vars, values only in `.env.local` and
   Vercel: `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `SLACK_CHANNEL_ID`.
   `.env.example` gains the three names, no values.

## Design decisions

- **Workspace scoping for Slack approvals.** Slack clicks carry no visitor cookie.
  The `tickets` table already stores `workspace_id` — a Slack approval resolves into
  the *ticket's own* workspace, so the visitor who filed it gets the learned
  correction on their next ask, identical to an `/inbox` approval. No new scoping
  mechanism, no cross-visitor leakage.
- **Edit-before-approve stays an `/inbox`-only feature.** Slack's Approve sends the
  draft as-is (or is disabled when there's no draft — a refusal with no proposed
  text has nothing to teach; the button set is then just "Open in Inbox" + Reject).
  Modal-based editing in Slack is real scope creep for zero demo value.
- **Message update over new message.** After resolution (from Slack *or* from
  `/inbox`), update the original Slack message via `chat.update`. Requires storing
  the Slack `channel` + `ts` on the ticket row → one new migration adding
  `slack_channel text null, slack_ts text null` to `tickets`.
- **`/inbox` and Slack stay consistent.** `resolveTicket` gains an optional
  "resolution source" (`inbox` | `slack`) recorded in the resolution jsonb and the
  audit trail; whichever side resolves first wins, the other side's attempt hits
  `already_resolved` and (for Slack) updates the message to reflect reality.
- **Evals unaffected.** `evals/run.ts` calls the lib pipeline directly and the env
  vars won't be set there; `postTicketNotification` no-ops silently when unset.
  Zero new model calls, zero spend-cap impact (Slack is free HTTP).

## Status (2026-08-08)

**Phases 0–4 built.** Typecheck + `npm run build` clean. Not yet committed/pushed
(standing rule — needs Ariel's go) and not yet verified E2E against the deployed URL,
since the interactive Approve/Reject buttons only work once `/api/slack/interact` is
live at `provenance.arielmagalso.com` (Slack's Request URL can't point at localhost).
Phase 5 is what's left.

One real deviation from this plan as originally written, found while implementing
Phase 3: the interact route does **not** call `chat.update` itself — that call lives
inside `resolveTicket` (via a new `updateSlackIfPosted` helper in `lib/inbox.ts`), so
both resolution paths (a Slack button click *and* an `/inbox` approve/dismiss) update
the Slack message through the exact same code, not two separate implementations that
could drift. The interact route just calls `resolveTicket(..., "slack", slackUser)`
and acks.

A second refinement beyond the original plan: `updateTicketMessage` doesn't collapse
the message down to a single status line on resolve (as first written) — it rebuilds
the same info blocks the original post used (question, answer/reason, draft) via a
shared `buildInfoBlocks` helper, then appends the resolved status underneath. The
original approach would have deleted the ticket's context from the channel the moment
it was resolved, which defeats the point of a channel-as-audit-trail.

### Phase 0 — Slack workspace + app (Ariel, manual, ~10 min) — DONE
1. Create (or reuse) a Slack workspace; create a channel, e.g. `#provenance-ops`.
2. api.slack.com → Create App (from scratch) → add **Bot Token Scopes**:
   `chat:write` (post + update). Install to workspace, invite the bot to the
   channel (`/invite @Provenance`).
3. Enable **Interactivity** and set the Request URL to
   `https://provenance.arielmagalso.com/api/slack/interact`.
4. Collect: Bot User OAuth Token (`xoxb-…`), Signing Secret, channel ID (`C…`).
5. Add the three env vars to `.env.local` (Windows machine) and Vercel
   (production + preview). **Blocker for phases 3+ verification; phases 1–2 can be
   built and unit-checked without them.**

### Phase 1 — `lib/slack.ts` — DONE
- Lazy env reads (gotcha #2 pattern — no module-scope throw).
- `isSlackConfigured()`, `postTicketNotification(decision)` → Block Kit payload per
  outcome table above, returns `{ channel, ts } | null`, never throws outward.
- `verifySlackSignature(rawBody, timestamp, signature)` → `node:crypto` HMAC,
  constant-time compare, ±5 min timestamp window.
- `updateTicketMessage(channel, ts, resolution)` → `chat.update`.

### Phase 2 — wire into the ticket path — DONE
- Migration: `tickets` + `slack_channel`, `slack_ts` (both nullable).
- `lib/tickets.ts` `runTicket`: after routing + persistence, fire
  `postTicketNotification`; on success store `{channel, ts}` on the ticket and
  append the `notification` audit event. All inside its own try/catch.
- `resolveTicket` (lib/inbox.ts): accept `source`, record it; after resolving, if
  the ticket has `slack_ts`, fire `updateTicketMessage` (again fire-and-forget).

### Phase 3 — `/api/slack/interact` route — DONE
- Slack sends `application/x-www-form-urlencoded` with a `payload` JSON field —
  **read the raw body first** for signature verification, then parse.
- Verify signature → parse action (`approve_ticket` / `reject_ticket` +
  ticket id in `action.value`) → call `resolveTicket(ticketId, action, undefined,
  ticket.workspace_id, "slack")` → respond within Slack's 3s window (ack
  immediately; do the work, then `chat.update`).
- Bad signature → 401. Unknown ticket / already resolved → ack + update message to
  current truth. Never a raw stack trace (working conventions).

### Phase 4 — UI truthfulness pass — DONE
- `/demo` + `/inbox` evidence panels: render the `notification` audit event row
  ("Posted to Slack #provenance-ops") — the simulation disclaimer copy gets
  amended to say send-to-customer is simulated **but the Slack operator
  notification is real**.
- `/architecture` page: add the connector to the flow description.

### Phase 5 — verify E2E + docs — NOT STARTED (needs deploy)
- Local first (Slack works from localhost for *posting*; the interactive callback
  needs the deployed URL — verify buttons on production after deploy, per the
  standing deploy-only-on-go rule).
- E2E checklist: approved ticket posts; human_review posts with buttons; Approve
  in Slack → ticket resolved + learned passage in the right workspace + cached
  refusal cleared + Slack message updated; second click → "already resolved";
  Reject → dismissed + message updated; env vars unset → pipeline behaves exactly
  as today; `npm run evals` still 45/45.
- README ("Possible extensions" → real feature), HANDOFF.md update, PRODUCT-PLAN
  Phase 4 marked partially done.

## Cost / risk

- $0 model cost, $0 Slack cost (free plan). No spend-cap interaction.
- Main risk: Slack's 3-second interactivity ack window vs. serverless cold start —
  mitigated by acking first and doing the resolve after (Slack allows async
  `response_url` follow-ups for 30 min).
- Rollback: unset the env vars → feature fully dark, zero code path change needed.

## Estimated effort

Phases 1–4 ≈ one focused session. Phase 0 is Ariel's ~10 minutes. Phase 5 needs a
deploy (explicit go, as always).
