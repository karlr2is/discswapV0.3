-- Migration: Create saved_searches table for search alerts feature
-- Timestamp: 20260313213000

create table if not exists public.saved_searches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  filters     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- Enable RLS
alter table public.saved_searches enable row level security;

-- Users can only manage their own saved searches
create policy "Users can view own saved searches"
  on public.saved_searches for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved searches"
  on public.saved_searches for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saved searches"
  on public.saved_searches for delete
  using (auth.uid() = user_id);

-- Index for fast user lookups
create index if not exists saved_searches_user_id_idx on public.saved_searches(user_id);
