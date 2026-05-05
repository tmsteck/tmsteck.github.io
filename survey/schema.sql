-- ============================================================================
-- Game Night Satisfaction Survey schema
-- Run this in the Supabase SQL editor for the project you want to use.
-- Tables are prefixed `gn_` so they will not collide with anything else
-- in the project.
-- ============================================================================

create table if not exists gn_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  payload jsonb not null,
  feedback_original text,
  feedback_rewritten text,
  rage_score int default 0,
  user_agent text
);

create table if not exists gn_events (
  id bigserial primary key,
  response_id uuid,
  event_type text,
  payload jsonb,
  ts timestamptz default now()
);

alter table gn_responses enable row level security;
alter table gn_events    enable row level security;

-- Anon role can only INSERT. No reads, no updates, no deletes.
drop policy if exists "anon insert responses" on gn_responses;
create policy "anon insert responses"
  on gn_responses for insert
  to anon
  with check (true);

drop policy if exists "anon insert events" on gn_events;
create policy "anon insert events"
  on gn_events for insert
  to anon
  with check (true);

-- Public results page (/survey/results/) reads aggregated stats directly
-- from gn_responses. Drop this policy if you want results to stay private.
drop policy if exists "anon read responses" on gn_responses;
create policy "anon read responses"
  on gn_responses for select
  to anon
  using (true);

-- Events stay write-only for anon.
-- Service role bypasses RLS, so dashboard analytics still work normally.
