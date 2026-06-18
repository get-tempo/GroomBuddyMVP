import { anthropic } from '@ai-sdk/anthropic';
import {
  streamText,
  tool,
  convertToModelMessages,
  type UIMessage,
} from 'ai';
import { z } from 'zod';
import { SYSTEM_PROMPT } from '@/lib/prompt';
import { findReferenceImages } from '@/lib/imageBank';
import { retrieveCurriculum } from '@/lib/rag';

// Allow streamed responses up to 30s (Vercel function default is short).
export const maxDuration = 30;

// One strong multimodal model for the MVP (no router yet, per build sheet).
// Swappable: change this one line to switch providers/models via the AI SDK.
// TODO verify the exact model id against the installed @ai-sdk/anthropic version.
const MODEL = anthropic('claude-sonnet-4-6');

// Pull the latest user text (for RAG). UIMessage content lives in `parts`.
function lastUserText(messages: UIMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === 'user');
  if (!last) return '';
  return last.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join(' ');
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // RAG context (returns "" until the curriculum is ingested; see lib/rag.ts).
  const context = await retrieveCurriculum(lastUserText(messages));
  const system = context
    ? `${SYSTEM_PROMPT}\n\nRELEVANT CURRICULUM:\n${context}`
    : SYSTEM_PROMPT;

  const result = streamText({
    model: MODEL,
    system,
    messages: convertToModelMessages(messages),
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
    },
  });

  return result.toUIMessageStreamResponse();
}
