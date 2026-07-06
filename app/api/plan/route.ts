import { generateText } from 'ai';
import { z } from 'zod';
import { MODEL } from '@/lib/model';
import { PLAN_SYSTEM } from '@/lib/prompt';
import { retrieveCurriculum } from '@/lib/rag';
import { accessRequired, codeOk } from '@/lib/access';

// Generate a full-groom plan for ONE dog (Guided mode). The school's canonical
// method (grounded in curriculum via RAG when available) tailored to breed +
// coat + style. Uses generateText + JSON parse (the same provider path as the
// working chat) rather than generateObject, which the OpenRouter provider
// doesn't reliably support for structured output.
export const maxDuration = 30;

// Mirrors the GroomStep shape the UI renders (data/groom-steps.ts).
const stepSchema = z.object({
  t: z.string(),
  quickRead: z.string(),
  doNext: z.string(),
  cue: z.string(),
  good: z.string(),
  watch: z.string(),
  ref: z.string(),
});
const planSchema = z.object({ steps: z.array(stepSchema).min(4).max(12) });

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

// Pull a JSON object out of the model's text, tolerating code fences or stray prose.
function parseSteps(text: string): unknown {
  let s = text.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  return JSON.parse(s);
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

  // RAG: pull the school's method most relevant to this groom. Best-effort —
  // retrieveCurriculum returns "" if Supabase/embeddings are unavailable, and
  // the plan is still tailored to breed + coat + style without it.
  const curriculum = await retrieveCurriculum(
    `full groom plan for a ${b}, coat ${c}, style ${s}: bath, brush out, clip, face, feet, sanitary, nails`,
  );
  let system = PLAN_SYSTEM;
  if (curriculum) system += `\n\nRELEVANT CURRICULUM:\n${curriculum}`;
  // Explicit output contract for generateText.
  system +=
    '\n\nOUTPUT FORMAT: Respond with ONLY a JSON object, no prose and no code fences, exactly:\n' +
    '{"steps":[{"t":"","quickRead":"","doNext":"","cue":"","good":"","watch":"","ref":""}]}\n' +
    'Include 7-10 step objects. Every field is a non-empty string.';

  const dog = `Dog: a ${b}. Coat condition: ${c || 'not specified'}. Desired style/length: ${s || 'not specified'}.`;

  try {
    const { text } = await generateText({
      model: MODEL,
      system,
      prompt: `${dog}\n\nWrite this dog's full-groom plan now as the JSON object.`,
    });
    const validated = planSchema.safeParse(parseSteps(text));
    if (!validated.success) throw new Error('plan did not match schema');
    return Response.json({ steps: validated.data.steps });
  } catch (e) {
    console.error('plan generation failed:', e);
    // The client shows a retry on a non-200.
    return new Response(JSON.stringify({ error: 'Could not build the plan.' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
