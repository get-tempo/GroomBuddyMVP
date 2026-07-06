import { generateObject } from 'ai';
import { z } from 'zod';
import { MODEL } from '@/lib/model';
import { PLAN_SYSTEM } from '@/lib/prompt';
import { retrieveCurriculum } from '@/lib/rag';
import { accessRequired, codeOk } from '@/lib/access';

// Generate a full-groom plan for ONE dog (Guided mode). The school's canonical
// method (grounded in curriculum via RAG) tailored to breed + coat + style.
export const maxDuration = 30;

// Mirrors the GroomStep shape the UI renders (data/groom-steps.ts).
const stepSchema = z.object({
  t: z.string().describe('Short step title, a few words.'),
  quickRead: z.string().describe('One line: what this step is and why it matters for this dog.'),
  doNext: z.string().describe('The concrete action(s) now, with the specific tool/blade/comb length.'),
  cue: z.string().describe('The one technique cue that makes it click.'),
  good: z.string().describe('How they know they did it right on this dog.'),
  watch: z.string().describe('The single most important thing to avoid here (fold in safety).'),
  ref: z.string().describe('Short plain caption naming a helpful reference image for this step.'),
});
const planSchema = z.object({
  steps: z.array(stepSchema).min(4).max(12),
});

// Keep the free-text intake bounded (cost/abuse) before any model work.
const MAX_FIELD = 120;
function clean(v: unknown): string {
  return typeof v === 'string' ? v.trim().slice(0, MAX_FIELD) : '';
}

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(req: Request) {
  // Same access gate as /api/chat — this is a model call, so protect the spend.
  if (accessRequired() && !codeOk(req.headers.get('x-access-code'))) {
    return new Response(JSON.stringify({ error: 'A valid access code is required.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON body.');
  }
  const { breed, coat, style } = (body ?? {}) as Record<string, unknown>;
  const b = clean(breed);
  const c = clean(coat);
  const s = clean(style);
  if (!b) return badRequest('`breed` is required.');

  // RAG: pull the school's method most relevant to this groom.
  const curriculum = await retrieveCurriculum(
    `full groom plan for a ${b}, coat ${c}, style ${s}: bath, brush out, clip, face, feet, sanitary, nails`,
  );
  let system = PLAN_SYSTEM;
  if (curriculum) system += `\n\nRELEVANT CURRICULUM:\n${curriculum}`;

  const dog = `Dog: a ${b}. Coat condition: ${c || 'not specified'}. Desired style/length: ${s || 'not specified'}.`;

  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: planSchema,
      system,
      prompt: `${dog}\n\nWrite this dog's full-groom plan now.`,
    });
    return Response.json({ steps: object.steps });
  } catch (e) {
    console.error('plan generation failed:', e);
    // The client falls back to the built-in canonical plan on a non-200.
    return new Response(JSON.stringify({ error: 'Could not build the plan.' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
