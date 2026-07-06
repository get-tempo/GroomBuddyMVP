# Grooming Buddy (MVP)

An AI co-instructor a grooming student can use mid-groom, from their phone, to
ask what to do next, how to do a technique, or get directional feedback on a
photo. Grounded in the school's own curriculum, with a reference-image bank.

This is the **build** repo. Strategy, pricing, and research live separately in
the `Groom-Buddy-Research` repo. Only build-relevant docs are mirrored here under
`docs/` (kept deliberately small).

## Stack

- **Next.js (App Router)** on **Vercel**, one codebase (UI + API routes).
- **Vercel AI SDK** for streaming chat, tool calling, and multimodal (photo) input.
- **Claude (Sonnet-class)** via **OpenRouter**, swappable in one line (`lib/model.ts`).
- **Supabase**: Postgres + pgvector (RAG) + anonymous event/survey capture.
- **OpenAI embeddings** (`text-embedding-3-small`) for RAG.

Served as a **phone-first web app (PWA)**, distributed by link/QR to the student
cohort. Not the app store (yet). See `docs/build-sheet.md`.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev
```

Open http://localhost:3000 on your phone (same network) or desktop.

### Env

See `.env.example`. The Supabase **service role key is server-only**, never
expose it to the client. (The reviewer agent treats that as a blocker.)

## Layout

```
app/                 Next.js app
  api/chat/route.ts  streaming chat: model + system prompt + image-bank tool + RAG
  page.tsx           phone-first chat UI (text + photo, renders reference images)
lib/
  prompt.ts          the Buddy system prompt + non-negotiable safety block
  imageBank.ts       keyed lookup over the image manifest (the findReferenceImages tool)
  rag.ts             curriculum retrieval via pgvector (LIVE; auto-enables when keyed)
  access.ts          pilot access-code gate (server-only; opt-in via ACCESS_CODE)
  supabase.ts        anon (browser) + admin (server-only) clients
data/
  image-manifest.json   the reference bank (currently 1 head-shape image)
public/reference/    the reference images themselves
docs/                build-relevant docs mirrored from the research repo
.claude/agents/
  code-reviewer.md   senior-dev + security reviewer (run before non-trivial commits)
```

## Current status

- Chat loop + image-bank tool + photo upload (HEIC-safe): wired and live.
- **RAG: LIVE.** Curriculum is ingested into Supabase pgvector; retrieval
  auto-enables when `OPENAI_API_KEY` + `SUPABASE_SERVICE_ROLE_KEY` are set. Falls
  back to no-context (never breaks chat) on any error. Re-ingest: `node
  scripts/ingest-curriculum.mjs` (curriculum/ is gitignored, proprietary).
- **Access gate: opt-in.** Set `ACCESS_CODE` in the deploy to require a shared
  class code (protects API spend on the public URL); leave blank to stay open.
- **Image bank: 1 image.** Grow the manifest toward ~10-15 as real labeled
  reference photos come in. (The old mislabeled rectangle placeholder was pulled.)
- Progress persistence, real auth, miss-logging dashboard, voice input: not built
  (intentionally out of pilot scope — the Den's stats are a labeled preview).

## Review

Before committing anything non-trivial, run the `code-reviewer` agent over the
diff. It carries a senior-engineer lens and a security lens tuned to this stack
(Supabase RLS, secret exposure, prompt injection, PII, dog-safety guardrails).

> Note: package versions move fast. If `npm install` resolves newer majors of
> `ai` / `@ai-sdk/*`, sanity-check the chat route and `useChat` against that
> version's API.
