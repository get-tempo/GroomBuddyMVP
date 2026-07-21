import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';

// Anonymous event logging (the data flywheel): what people ask, which steps they
// open, photo checks, safety hits. No accounts — just a random per-session id.
// (One PII caveat: server-written `model_call` rows from lib/rateLimit.ts carry
// the caller IP for rate limiting; prune them on a retention schedule — see
// scripts/events-maintenance.sql.) No-ops cleanly when Supabase isn't configured, so the demo never breaks.

type EventBody = { sessionId?: string; type?: string; payload?: Record<string, unknown> };

// This endpoint is public and unauthenticated, and the rate limiter counts rows
// in the same table (lib/rateLimit.ts), so inserts must be bounded and the
// server-reserved type must be unforgeable.
const MAX_TYPE_CHARS = 64;
const MAX_SESSION_CHARS = 64;
const MAX_PAYLOAD_CHARS = 2000;
const RESERVED_TYPES = ['model_call']; // written server-side only; a forged row would rate-limit someone else

export async function POST(req: Request) {
  if (!supabaseConfigured()) return Response.json({ ok: false, skipped: true });

  try {
    const { sessionId, type, payload }: EventBody = await req.json();
    const t = typeof type === 'string' ? type.trim() : '';
    if (!t || t.length > MAX_TYPE_CHARS || RESERVED_TYPES.includes(t)) {
      return Response.json({ ok: false, error: 'bad type' }, { status: 400 });
    }
    const p = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
    if (JSON.stringify(p).length > MAX_PAYLOAD_CHARS) {
      return Response.json({ ok: false, error: 'payload too large' }, { status: 400 });
    }
    const sid = typeof sessionId === 'string' && sessionId ? sessionId.slice(0, MAX_SESSION_CHARS) : 'anon';

    await supabaseAdmin().from('events').insert({ session_id: sid, type: t, payload: p });

    return Response.json({ ok: true });
  } catch (e) {
    console.error('event log failed:', e);
    return Response.json({ ok: false }, { status: 200 }); // never surface to the user
  }
}
