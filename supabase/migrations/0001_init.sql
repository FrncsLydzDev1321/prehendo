-- Prehendo database schema.
-- Run this ONCE in Supabase: Dashboard → SQL Editor → New query → paste → Run.

-- ── Teacher profiles ─────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  username text not null unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Teachers can read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

-- Create a profile automatically when a teacher registers.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'username', new.id::text)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Cases ────────────────────────────────────────────────────
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  verdict text not null check (verdict in ('real', 'fake', 'misleading')),
  techniques text[] not null default '{}',
  difficulty int not null check (difficulty between 1 and 3),
  topic text not null,
  content jsonb not null,
  evidence jsonb not null,
  explanation text not null,
  clue_notes jsonb not null default '{}',
  validation jsonb,            -- AI validator report (kept as an audit trail)
  ai_model text,               -- which open-weight model wrote it
  created_at timestamptz not null default now(),
  reviewed_at timestamptz      -- when the teacher approved/rejected it
);

create index if not exists cases_status_difficulty_idx on public.cases (status, difficulty);
create index if not exists cases_created_by_idx on public.cases (created_by);

alter table public.cases enable row level security;

-- Teachers only see and manage THEIR OWN cases.
-- Students never query this table directly: the server reads approved
-- cases with the secret key and hides the answer key until they answer.
create policy "Teachers read own cases"
  on public.cases for select to authenticated
  using (created_by = (select auth.uid()));

create policy "Teachers create own cases"
  on public.cases for insert to authenticated
  with check (created_by = (select auth.uid()));

create policy "Teachers update own cases"
  on public.cases for update to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

create policy "Teachers delete own cases"
  on public.cases for delete to authenticated
  using (created_by = (select auth.uid()));

-- ── Attempts (anonymous student answers) ─────────────────────
create table if not exists public.attempts (
  id bigint generated always as identity primary key,
  case_id uuid not null references public.cases (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 24),
  verdict text not null,
  clues text[] not null default '{}',
  correct boolean not null,
  points int not null,
  created_at timestamptz not null default now()
);

create index if not exists attempts_case_id_idx on public.attempts (case_id);

alter table public.attempts enable row level security;

-- Teachers can see attempts on their own cases. Inserts happen on the server only.
create policy "Teachers read attempts on own cases"
  on public.attempts for select to authenticated
  using (case_id in (select id from public.cases where created_by = (select auth.uid())));
