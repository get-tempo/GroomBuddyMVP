import { generateText } from 'ai';
import { z } from 'zod';
import { MODEL, PLAN_MODEL } from '@/lib/model';
import { PLAN_SYSTEM } from '@/lib/prompt';
import { retrieveCurriculum } from '@/lib/rag';
import { accessRequired, codeOk } from '@/lib/access';

// Generate a full-groom plan for ONE dog (Guided mode). The school's canonical
// method (grounded in curriculum via RAG when available) tailored to breed +
// coat + style. Uses generateText + JSON parse (the same provider path as the
// working chat) rather than generateObject, which the OpenRouter provider
// doesn't reliably support for structured output.
// Generating a 7-9 step JSON plan takes longer than a chat reply, so give it
// headroom over the 30s default (a full plan can run 15-40s on Sonnet).
export const maxDuration = 60;

// Mirrors the GroomStep shape the UI renders (data/groom-steps.ts).
const stepSchema = z.object({
  t: z.string(),
  quickRead: z.string(),
  // 2-4 concrete ordered actions. Tolerate a bare string by wrapping it.
  doNext: z.preprocess(
    (v) => (typeof v === 'string' ? [v] : v),
    z.array(z.string()).min(1).max(6),
  ),
  cue: z.string(),
  good: z.string(),
  watch: z.string(),
  ref: z.string(),
});
type Step = z.infer<typeof stepSchema>;

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

// Salvage the step objects from the model's text. We scan for balanced { } blocks
// and keep the ones that validate as a step, so it's robust to code fences, stray
// prose, and a truncated final object (that block won't balance -> skipped) rather
// than throwing the whole plan away. Works whether the model wraps the steps in
// {"steps":[...]} or returns a bare [...] array.
function parseSteps(text: string): Step[] {
  const steps: Step[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        try {
          const parsed = stepSchema.safeParse(JSON.parse(text.slice(start, i + 1)));
          if (parsed.success) steps.push(parsed.data);
        } catch {
          // not a JSON object / not a step — skip it
        }
        start = -1;
      }
    }
  }
  return steps;
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
    '\n\nOUTPUT FORMAT: Respond with ONLY a JSON array of step objects, no prose and no code fences, exactly:\n' +
    '[{"t":"","quickRead":"","doNext":["",""],"cue":"","good":"","watch":"","ref":""}, ...]\n' +
    'Include 7-9 step objects. `doNext` is an array of 2-4 short action strings; every other field is a non-empty single short sentence.';

  const dog = `Dog: a ${b}. Coat condition: ${c || 'not specified'}. Desired style/length: ${s || 'not specified'}.`;

  const gen = (model: typeof MODEL) =>
    generateText({
      model,
      system,
      prompt: `${dog}\n\nWrite this dog's full-groom plan now as the JSON array.`,
      // Headroom for 7-9 concise steps; the salvage parser tolerates a cut-off tail.
      maxOutputTokens: 3600,
    });

  try {
    // Fast scaffold model first; fall back to the main model if that slug is
    // unavailable or errors, so a plan always builds.
    let text: string;
    try {
      ({ text } = await gen(PLAN_MODEL));
    } catch (fastErr) {
      console.error('plan fast-model failed, falling back to main model:', fastErr);
      ({ text } = await gen(MODEL));
    }
    const steps = parseSteps(text);
    if (steps.length < 4) throw new Error(`only ${steps.length} valid steps parsed`);
    return Response.json({ steps: steps.slice(0, 12) });
  } catch (e) {
    console.error('plan generation failed:', e);
    // The client shows a retry on a non-200.
    return new Response(JSON.stringify({ error: 'Could not build the plan.' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
