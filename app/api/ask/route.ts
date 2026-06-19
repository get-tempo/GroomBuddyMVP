import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { SYSTEM_PROMPT } from '@/lib/prompt';
import { findReferenceImages, type ReferenceMatch } from '@/lib/imageBank';
import { retrieveCurriculum } from '@/lib/rag';

// One-shot Buddy answers for Quick mode (How do I…, is this okay?, freeform)
// and photo coaching. Non-streaming so the UI can drop the reply into a single
// designed bubble. The Guided flow does NOT use this — it is fully local.
//
// If the Anthropic key is missing/invalid this throws and returns 500; the
// client then shows the designed canned response, so the demo always works.

export const maxDuration = 30;

const MODEL = anthropic('claude-sonnet-4-6');

type AskBody = {
  text: string;
  mode?: 'how' | 'ok' | 'showme' | 'free' | 'photo';
  context?: string; // e.g. "Dog: Maple, Goldendoodle. Current step: Scissor the face."
  imageDataUrl?: string; // base64 data URL for photo coaching
};

export async function POST(req: Request) {
  const { text, mode = 'free', context, imageDataUrl }: AskBody = await req.json();

  // "Show me one" is a deterministic image-bank lookup, not a generation.
  let images: ReferenceMatch[] = [];
  if (mode === 'showme') images = findReferenceImages(text);

  const curriculum = await retrieveCurriculum(text);
  const system =
    SYSTEM_PROMPT +
    (curriculum ? `\n\nRELEVANT CURRICULUM:\n${curriculum}` : '') +
    (context ? `\n\nCONTEXT:\n${context}` : '');

  // Photo coaching: 1 positive + 1 next-improvement, never a grade.
  const userText =
    mode === 'photo'
      ? `Here's my photo. ${text || 'How is it looking and what should I fix first?'}`
      : text;

  const content = imageDataUrl
    ? [
        { type: 'text' as const, text: userText },
        { type: 'image' as const, image: imageDataUrl },
      ]
    : userText;

  const { text: reply } = await generateText({
    model: MODEL,
    system,
    messages: [{ role: 'user', content }],
  });

  return Response.json({ text: reply, images });
}
