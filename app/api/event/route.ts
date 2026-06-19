import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';

// Anonymous event logging (the data flywheel): what people ask, which steps they
// open, photo checks, safety hits. No accounts, no PII — just a random per-session
// id. No-ops cleanly when Supabase isn't configured, so the demo never breaks.

type EventBody = { sessionId?: string; type?: string; payload?: Record<string, unknown> };

export async function POST(req: Request) {
  if (!supabaseConfigured()) return Response.json({ ok: false, skipped: true });

  try {
    const { sessionId, type, payload }: EventBody = await req.json();
    if (!type) return Response.json({ ok: false, error: 'missing type' }, { status: 400 });

    await supabaseAdmin()
      .from('events')
      .insert({ session_id: sessionId ?? 'anon', type, payload: payload ?? {} });

    return Response.json({ ok: true });
  } catch (e) {
    console.error('event log failed:', e);
    return Response.json({ ok: false }, { status: 200 }); // never surface to the user
  }
}
