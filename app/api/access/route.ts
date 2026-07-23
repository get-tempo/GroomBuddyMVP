import { emailOk, normalizeEmail } from '@/lib/access';
import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';

// The email gate. GET tells the client the gate is on (it always is now).
// POST validates the email, records it as a lead (events table,
// type 'email_capture'), and unlocks. Enforcement on model spend lives in
// /api/chat, /api/plan and /api/transcribe via the x-user-email header.

export async function GET() {
  return Response.json({ required: true });
}

export async function POST(req: Request) {
  let body: { email?: string; sessionId?: string };
  try {
    body = (await req.json()) as { email?: string; sessionId?: string };
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const raw = typeof body.email === 'string' ? body.email : '';
  if (!emailOk(raw)) return Response.json({ ok: false });

  const email = normalizeEmail(raw);
  // Lead capture: best-effort, never blocks the unlock.
  if (supabaseConfigured()) {
    try {
      const sid = typeof body.sessionId === 'string' && body.sessionId ? body.sessionId.slice(0, 64) : 'anon';
      await supabaseAdmin().from('events').insert({ session_id: sid, type: 'email_capture', payload: { email } });
    } catch (e) {
      console.error('email capture failed:', e);
    }
  }
  return Response.json({ ok: true });
}
