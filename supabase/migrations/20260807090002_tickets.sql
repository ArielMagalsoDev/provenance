-- Tickets were previously ephemeral — only audit_events persisted, so nothing
-- could list "what's open right now." The Agent Inbox needs a real queue to
-- read from. workspace_id null = a shared-demo ticket (guided scenarios and
-- anonymous free-text tickets with no workspace yet); non-null scopes it to
-- one visitor's session, same posture as passages.workspace_id.
create table tickets (
  id                text primary key,
  workspace_id      uuid null,
  channel           text not null,
  customer_name     text not null,
  customer_context  text,
  category           text not null,
  message           text not null,
  outcome           text not null,             -- approved | human_review | blocked
  reason            text not null,
  proposed_response text,
  citations         jsonb not null default '[]',
  groundedness      numeric,
  status            text not null default 'open'
    check (status in ('open', 'resolved')),
  resolution        jsonb,                      -- {action, editedResponse, resolvedAt}
  created_at        timestamptz not null default now()
);

create index tickets_status_created_idx on tickets (status, created_at desc);
create index tickets_workspace_id_idx on tickets (workspace_id) where workspace_id is not null;

alter table tickets enable row level security;
-- Same posture as every other table: service_role only, no anon/authenticated grants.
