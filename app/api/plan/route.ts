import { streamText } from 'ai';
import { MODEL, PLAN_MODEL } from '@/lib/model';
import { PLAN_SYSTEM } from '@/lib/prompt';
import { retrieveCurriculum } from '@/lib/rag';
import { emailOk } from '@/lib/access';
import { allowModelCall } from '@/lib/rateLimit';

// Generate a full-groom plan for ONE dog (Guided mode). The school's canonical
// method (grounded in curriculum via RAG when available) tailored to breed +
// coat + style.
//
// STREAMED: the route returns the model's raw text as it generates; the client
// parses complete step objects out of the partial text (lib/planSteps.ts) and
// renders them as they land — first step on screen in seconds, rest fill in.
// ?m=main pins the main model (the client's retry path when the fast plan
// model returns nothing usable).
// A full plan can run 15-40s, so give headroom over the 30s default.
export const maxDuration = 60;

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
  if (!emailOk(req.headers.get('x-user-email'))) {
    return new Response(JSON.stringify({ error: 'An email is required. Refresh and enter your email to continue.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Per-device/IP spend cap (see lib/rateLimit.ts). Runs before any model work.
  const limit = await allowModelCall(req, 'plan');
  if (!limit.ok) {
    return new Response(JSON.stringify({ error: limit.message }), {
      status: 429,
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

  // Fast scaffold model by default; the client retries with ?m=main if the
  // stream yields no parseable steps (bad slug, provider hiccup).
  const model = new URL(req.url).searchParams.get('m') === 'main' ? MODEL : PLAN_MODEL;

  try {
    const result = streamText({
      model,
      system,
      prompt: `${dog}\n\nWrite this dog's full-groom plan now as the JSON array.`,
      // Headroom for 7-9 concise steps; the salvage parser tolerates a cut-off tail.
      maxOutputTokens: 3600,
      onError: (e) => console.error('plan stream error:', e),
    });
    return result.toTextStreamResponse();
  } catch (e) {
    console.error('plan generation failed:', e);
    // The client shows a retry on a non-200.
    return new Response(JSON.stringify({ error: 'Could not build the plan.' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
