import { emailOk } from '@/lib/access';
import { allowModelCall } from '@/lib/rateLimit';

// Voice input: the client records a short clip (MediaRecorder) and posts it
// here; we forward it to OpenAI Whisper and hand back the transcript, which
// lands in the chat input for the student to review and send. Same protections
// as /api/chat: access code, per-device rate limit, hard size cap.
//
// Uses the OPENAI_API_KEY already present for RAG embeddings. Whisper is
// $0.006/min, so a chatty pilot day is pennies.

export const maxDuration = 30;

// ~90s of AAC/Opus voice is well under 2MB; 8MB leaves headroom without
// letting anyone stream us an album.
const MAX_AUDIO_BYTES = 8_000_000;

// Grooming vocab hint. Whisper uses the prompt as style/vocabulary context,
// which keeps trade terms from coming back as soundalikes ("number ten blade",
// not "number ten laid").
const VOCAB_PROMPT =
  'A dog grooming student asking their instructor a question. Terms: matting, dematting, ' +
  'undercoat, clipper, number ten blade, guard comb, sanitary trim, dewclaw, quick, ' +
  'fluff dry, teddy bear cut, Goldendoodle, Shih Tzu, Schnauzer, Cocker Spaniel.';

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(req: Request) {
  if (!emailOk(req.headers.get('x-user-email'))) {
    return jsonError('An email is required. Refresh and enter your email to continue.', 401);
  }
  const limit = await allowModelCall(req, 'transcribe');
  if (!limit.ok) return jsonError(limit.message, 429);

  const key = (process.env.OPENAI_API_KEY ?? '').trim();
  if (!key) return jsonError('Voice is not set up on this deploy.', 503);

  let audio: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get('audio');
    if (f instanceof File) audio = f;
  } catch {
    return jsonError('Expected multipart form data with an `audio` file.', 400);
  }
  if (!audio || audio.size === 0) return jsonError('No audio received.', 400);
  if (audio.size > MAX_AUDIO_BYTES) return jsonError('Recording is too long.', 400);

  // Whisper keys the container format off the filename extension. Real clients
  // send webm (Chrome/Android) or mp4 (iOS Safari); the rest is belt-and-braces.
  const ext =
    ['mp4', 'webm', 'wav', 'ogg'].find((e) => audio.type.includes(e)) ??
    (audio.type.includes('mpeg') ? 'mp3' : 'm4a');
  const name = `voice.${ext}`;

  const upstream = new FormData();
  upstream.append('file', audio, name);
  upstream.append('model', 'whisper-1');
  upstream.append('language', 'en');
  upstream.append('prompt', VOCAB_PROMPT);

  try {
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: upstream,
    });
    if (!res.ok) {
      console.error('transcribe failed:', res.status, await res.text());
      return jsonError("Buddy couldn't make that out. Try again?", 502);
    }
    const { text } = (await res.json()) as { text?: string };
    return Response.json({ text: (text ?? '').trim() });
  } catch (e) {
    console.error('transcribe error:', e);
    return jsonError("Buddy couldn't make that out. Try again?", 502);
  }
}
