// RAG over the school's curriculum: embed the student's query, find the closest
// curriculum chunks in Supabase pgvector, return them as context for the prompt.
//
// STATUS: stubbed for day 1. The curriculum content is PARTIAL (build sheet), so
// this returns "" until the curriculum is ingested. Wiring is here so turning it
// on is a small step, not a rewrite.
//
// To turn on:
//   1. Create a `curriculum_chunks` table in Supabase with a `vector` column +
//      an RPC `match_curriculum(query_embedding, match_count)` (pgvector cosine).
//   2. Ingest the cleaned curriculum (chunk -> embed -> insert).
//   3. Flip RAG_ENABLED to true.

import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { supabaseAdmin } from '@/lib/supabase';

const RAG_ENABLED = false;
const MATCH_COUNT = 5;

export async function retrieveCurriculum(query: string): Promise<string> {
  if (!RAG_ENABLED || !query.trim()) return '';

  try {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query,
    });

    const { data, error } = await supabaseAdmin().rpc('match_curriculum', {
      query_embedding: embedding,
      match_count: MATCH_COUNT,
    });
    if (error) throw error;

    return (data ?? [])
      .map((row: { content: string }) => row.content)
      .join('\n\n---\n\n');
  } catch (e) {
    // Never let RAG failure break the chat. Fall back to no-context.
    console.error('retrieveCurriculum failed:', e);
    return '';
  }
}
