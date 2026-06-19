-- Grooming Buddy — Supabase schema.
-- Run this once in the Supabase SQL editor (Dashboard -> SQL -> New query).
-- Everything here is written/read ONLY by server routes using the service-role
-- key, so RLS is enabled with NO public policies (anon/auth clients get nothing).
-- The app is account-free; we capture anonymous, no-PII data keyed by a random
-- per-session id generated client-side.

-- ---------- extensions ----------
create extension if not exists vector;

-- ---------- 1. event log (the data flywheel) ----------
-- What people ask in Quick, which steps they open, photo checks, safety hits.
create table if not exists public.events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  session_id  text not null,           -- random per app-load id, no PII
  type        text not null,           -- 'quick_question' | 'step_open' | 'photo_check' | 'safety' | ...
  payload     jsonb not null default '{}'::jsonb
);
create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_type_idx on public.events (type);

alter table public.events enable row level security;
-- (no policies => only the service-role key can read/write)

-- ---------- 2. end-of-demo survey ----------
create table if not exists public.survey_responses (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  session_id    text,
  would_use     text,   -- e.g. 'yes' | 'maybe' | 'no'
  whats_missing text,
  would_pay     text,
  comment       text
);
alter table public.survey_responses enable row level security;

-- ---------- 3. curriculum chunks (RAG) ----------
-- text-embedding-3-small = 1536 dims. Ingest with scripts/ingest-curriculum.mjs.
create table if not exists public.curriculum_chunks (
  id         bigint generated always as identity primary key,
  content    text not null,
  metadata   jsonb not null default '{}'::jsonb,
  embedding  vector(1536)
);
alter table public.curriculum_chunks enable row level security;

-- cosine-similarity matcher used by lib/rag.ts
create or replace function public.match_curriculum(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (id bigint, content text, metadata jsonb, similarity float)
language sql stable
as $$
  select
    c.id,
    c.content,
    c.metadata,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.curriculum_chunks c
  where c.embedding is not null
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
