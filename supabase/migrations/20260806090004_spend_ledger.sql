-- Postgres-backed replacement for the spec's Upstash spend counter.
create table spend_ledger (
  day        date primary key default current_date,
  spent_usd  numeric not null default 0
);

alter table spend_ledger enable row level security;

-- Atomic charge/refund. Charge BEFORE the model call with an estimate; call again with
-- a negative amount to refund on failure or when the post-charge total blows the cap
-- (avoids a check-then-charge race: charge first, inspect the authoritative returned
-- total, refund immediately if it pushed the day over budget).
create or replace function increment_spend(p_amount numeric)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total numeric;
begin
  insert into spend_ledger (day, spent_usd)
  values (current_date, p_amount)
  on conflict (day) do update set spent_usd = spend_ledger.spent_usd + excluded.spent_usd
  returning spent_usd into v_total;
  return v_total;
end;
$$;

create or replace function get_today_spend()
returns numeric
language sql
security definer
set search_path = public
as $$
  select coalesce(spent_usd, 0) from spend_ledger where day = current_date;
$$;
