import {
  streamText,
  stepCountIs,
  tool,
  convertToModelMessages,
  type UIMessage,
} from 'ai';
import { MODEL } from '@/lib/model';
import { z } from 'zod';
import { SYSTEM_PROMPT } from '@/lib/prompt';
import { findReferenceImages } from '@/lib/imageBank';
import { retrieveCurriculum } from '@/lib/rag';
import { accessRequired, codeOk } from '@/lib/access';
import { allowModelCall } from '@/lib/rateLimit';

// Allow streamed responses up to 30s (Vercel function default is short).
export const maxDuration = 30;

// One strong multimodal model for the MVP (no router yet, per build sheet).
// MODEL is defined in lib/model.ts (routed through OpenRouter), so switching
// providers/models is one file, not every call site.

// Pull the latest user text (for RAG). UIMessage content lives in `parts`.
function lastUserText(messages: UIMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === 'user');
  if (!last) return '';
  return last.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join(' ');
}

// Caps on the public, unauthenticated chat endpoint to bound cost/DoS abuse.
const MAX_MESSAGES = 40;
const MAX_TEXT_CHARS = 24_000; // total text across all message parts
const MAX_IMAGES = 6;
const MAX_IMAGE_CHARS = 14_000_000; // ~10MB encoded as a base64 data URL
const MAX_CONTEXT_CHARS = 2_000;
const ALLOWED_IMAGE = /^data:image\/(jpe?g|png|webp|gif|hei[cf]);base64,/i;

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(req: Request) {
  // Access gate: when ACCESS_CODE is configured, every model call must carry a
  // valid x-access-code header. This is what actually protects API spend — a
  // leaked link with no code can't reach the model. No-op when ACCESS_CODE unset.
  if (accessRequired() && !codeOk(req.headers.get('x-access-code'))) {
    return new Response(JSON.stringify({ error: 'A valid access code is required.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Per-device/IP spend cap (see lib/rateLimit.ts). Runs before any model work.
  const limit = await allowModelCall(req, 'chat');
  if (!limit.ok) {
    return new Response(JSON.stringify({ error: limit.message }), {
      status: 429,
      headers: { 'content-type': 'application/json' },
    });
  }

  // `context` is the lightweight session context from the client (e.g. the
  // breed on the table). RAG curriculum is retrieved server-side below.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON body.');
  }
  const { messages, context: clientContext } = (body ?? {}) as {
    messages?: UIMessage[];
    context?: string;
  };

  // Validate shape + bound payload BEFORE any model/embedding work runs.
  if (!Array.isArray(messages) || messages.length === 0) {
    return badRequest('`messages` must be a non-empty array.');
  }
  if (messages.length > MAX_MESSAGES) {
    return badRequest('Too many messages.');
  }
  if (
    clientContext !== undefined &&
    (typeof clientContext !== 'string' || clientContext.length > MAX_CONTEXT_CHARS)
  ) {
    return badRequest('Invalid `context`.');
  }
  let textChars = 0;
  let imageCount = 0;
  for (const m of messages) {
    const parts = (m as { parts?: unknown }).parts;
    if (!Array.isArray(parts)) continue;
    for (const p of parts as Array<Record<string, unknown>>) {
      if (p?.type === 'text' && typeof p.text === 'string') {
        textChars += p.text.length;
      } else if (p?.type === 'file') {
        imageCount += 1;
        const url = typeof p.url === 'string' ? p.url : '';
        // Only inline image data URLs — never a remote URL the server would fetch (SSRF).
        if (!ALLOWED_IMAGE.test(url)) return badRequest('Only inline image data URLs are allowed.');
        if (url.length > MAX_IMAGE_CHARS) return badRequest('Image is too large.');
      }
    }
  }
  if (textChars > MAX_TEXT_CHARS) return badRequest('Message text is too long.');
  if (imageCount > MAX_IMAGES) return badRequest('Too many images.');

  // RAG context (returns "" until the curriculum is ingested; see lib/rag.ts).
  const curriculum = await retrieveCurriculum(lastUserText(messages));
  let system = SYSTEM_PROMPT;
  if (curriculum) system += `\n\nRELEVANT CURRICULUM:\n${curriculum}`;
  if (clientContext) system += `\n\nCONTEXT:\n${clientContext}`;

  const result = streamText({
    model: MODEL,
    system,
    messages: convertToModelMessages(messages),
    // Let Buddy call findReferenceImages and THEN reply in words; without this
    // a tool call ends the turn with no follow-up text.
    stopWhen: stepCountIs(5),
    tools: {
      findReferenceImages: tool({
        description:
          'Search the school reference image bank for a teaching image (head shapes, coat types, finished styles). Call when seeing a picture helps more than words. Returns the best matches, or nothing if no strong match (then describe in words instead).',
        inputSchema: z.object({
          query: z
            .string()
            .describe('The concept the student needs to see, in plain language.'),
          maxResults: z.number().optional(),
        }),
        execute: async ({ query, maxResults }) =>
          findReferenceImages(query, maxResults ?? 3),
      }),
      // No execute => this is answered on the CLIENT. The model calls it to ask
      // the student up to 3 quick multiple-choice questions before photo
      // feedback; the UI renders the cards and sends the answers back.
      askQuestions: tool({
        description:
          'Ask the student up to 3 short multiple-choice questions to get the context you need BEFORE giving photo feedback (intended style/length, coat pattern, focus area). Only call this when a PHOTO was sent AND that context is missing from their message. Each question has 2-4 short tap options. See ASK BEFORE PHOTO FEEDBACK in the system prompt.',
        inputSchema: z.object({
          questions: z
            .array(
              z.object({
                id: z.string().describe('short stable key, e.g. "style" or "coat"'),
                question: z.string().describe('the question, short and plain'),
                options: z
                  .array(z.string())
                  .min(2)
                  .max(4)
                  .describe('2-4 short tap-able answer options'),
              }),
            )
            .min(1)
            .max(3),
        }),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
