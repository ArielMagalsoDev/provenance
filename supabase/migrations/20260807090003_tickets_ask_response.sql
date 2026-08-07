-- Stores the full AskResponse alongside the ticket's summary fields, so the
-- Agent Inbox can render the exact same evidence panel as /demo (non-
-- negotiable #1: every response's pipeline is visible, nothing hidden) —
-- not a reconstructed summary of it.
alter table tickets add column ask_response jsonb null;
