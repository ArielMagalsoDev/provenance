-- First real downstream connector (Slack) — see docs/PLAN-slack-integration.md.
-- Stores which Slack message (if any) a ticket was posted as, so the message
-- can be updated in place after resolution instead of leaving stale buttons
-- or posting a duplicate. Both nullable: a ticket only gets these once
-- postTicketNotification() succeeds (Slack is fire-and-forget, never a gate —
-- see lib/slack.ts), and older rows predate this feature entirely.
alter table tickets
  add column slack_channel text null,
  add column slack_ts      text null;

-- audit_events.stage has no DB-level CHECK (see its own migration's comment,
-- which documents the allowed values) — the enum lives in lib/types.ts only.
-- Recorded here for anyone reading migrations top-to-bottom: this feature
-- adds a new "notification" stage value, no schema change needed for it.
