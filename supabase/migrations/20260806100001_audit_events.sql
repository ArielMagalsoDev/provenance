-- Append-only audit trail for Meridian Assist tickets. Real, persisted records — not
-- simulated — even though the "reply sent" / "escalated" action itself is simulated
-- (no real email/ticketing integration exists yet; see docs/PRODUCT-PLAN.md Phase 4).
create table audit_events (
  id         bigint generated always as identity primary key,
  ticket_id  text not null,
  stage      text not null, -- intake|screening|retrieval|generation|verification|routing|action
  outcome    text not null,
  detail     text,
  created_at timestamptz not null default now()
);

create index on audit_events (ticket_id, created_at);

alter table audit_events enable row level security;
-- Same posture as every other table: service_role only, no anon/authenticated grants.
