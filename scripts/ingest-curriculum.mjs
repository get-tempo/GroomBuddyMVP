/**
 * Ingest the school's curriculum into Supabase pgvector for RAG.
 *
 * Usage (after you have curriculum + keys):
 *   1. Put .md / .txt curriculum files in ./curriculum/
 *   2. Ensure .env.local has OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL,
 *      SUPABASE_SERVICE_ROLE_KEY, and that schema.sql has been run.
 *   3. node scripts/ingest-curriculum.mjs
 *
 * Chunks each file by paragraph (~800 chars), embeds with text-embedding-3-small,
 * and inserts into public.curriculum_chunks. Re-running clears + reloads.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

// minimal .env.local loader (no dependency)
if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const { OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!OPENAI_API_KEY || !NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing OPENAI_API_KEY / Supabase env. See header.');
  process.exit(1);
}

const DIR = 'curriculum';
if (!existsSync(DIR)) {
  console.error(`No ./${DIR}/ folder. Put curriculum .md/.txt files there.`);
  process.exit(1);
}

function chunk(text, max = 800) {
  const out = [];
  let buf = '';
  for (const para of text.split(/\n\s*\n/)) {
    if ((buf + '\n\n' + para).length > max && buf) { out.push(buf.trim()); buf = para; }
    else { buf = buf ? `${buf}\n\n${para}` : para; }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

async function embed(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  });
  if (!res.ok) throw new Error(`embeddings ${res.status}: ${await res.text()}`);
  return (await res.json()).data[0].embedding;
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const files = readdirSync(DIR).filter((f) => /\.(md|txt)$/i.test(f));
if (!files.length) { console.error('No .md/.txt files found.'); process.exit(1); }

console.log('Clearing existing curriculum_chunks...');
await supabase.from('curriculum_chunks').delete().neq('id', 0);

let n = 0;
for (const file of files) {
  const text = readFileSync(join(DIR, file), 'utf8');
  for (const content of chunk(text)) {
    const embedding = await embed(content);
    const { error } = await supabase
      .from('curriculum_chunks')
      .insert({ content, embedding, metadata: { source: file } });
    if (error) { console.error('insert failed:', error); process.exit(1); }
    n++;
    process.stdout.write(`\ringested ${n} chunks`);
  }
}
console.log(`\nDone. ${n} chunks from ${files.length} file(s).`);
