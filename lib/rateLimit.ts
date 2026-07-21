// Per-device rate limiting for the model-cost routes (/api/chat, /api/plan).
// No accounts yet, so identity is the anonymous device id the client mints into
// localStorage (x-device-id header), with the caller's IP as a backstop for
// clients that strip the header. Counts live in the existing Supabase `events`
// table (type 'model_call', session_id = device id), so limits hold across
// serverless instances without new infrastructure.
//
// SERVER ONLY (imports supabaseAdmin).
//
// Philosophy matches the rest of the stack: fail OPEN. If Supabase is down we
// serve the request rather than break the demo; the access-code gate is still
// the first line of defense on the public URL.

import { supabaseAdmin, supabaseConfigured } from './supabase';

function envNum(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// Per-device: generous for a student mid-groom, tight enough to bound spend.
// Per-IP: a backstop only — the whole class sits behind one school/salon IP,
// so this must stay far above device limits times a realistic cohort size.
const DEVICE_HOURLY = envNum('RATE_DEVICE_HOURLY', 30);
const DEVICE_DAILY = envNum('RATE_DEVICE_DAILY', 150);
const IP_HOURLY = envNum('RATE_IP_HOURLY', 400);

const LIMIT_MESSAGE =
  "Buddy needs a quick breather. You've hit the limit for now, so take a stretch and try again in a little while.";

// NOTE: trusting x-forwarded-for is safe ON VERCEL ONLY (the platform
// overwrites it, so clients can't spoof it). If this ever moves hosts or gains
// another proxy in front, revisit — a spoofable IP plus client-minted device
// ids would make the limiter fully bypassable.
export function callerIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

export async function allowModelCall(
  req: Request,
  route: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!supabaseConfigured()) return { ok: true };

  const raw = req.headers.get('x-device-id')?.trim() ?? '';
  const ip = callerIp(req);
  // No/garbage device id? Fall back to IP identity so the limit still binds.
  const device = /^[\w-]{8,64}$/.test(raw) ? raw : `ip:${ip}`;

  try {
    const db = supabaseAdmin();

    // Insert FIRST, then count (the count includes our own row, so the compare
    // is `> limit`, not `>=`). Counting first would let N parallel requests all
    // see pre-burst counts and all pass. Side effect, intentional: denied
    // attempts also accrue, so a hammering client keeps itself limited.
    const ins = await db.from('events').insert({
      session_id: device,
      type: 'model_call',
      payload: { route, ip },
    });
    // supabase-js reports errors in-band (it doesn't throw) — log them loudly,
    // then fail open. A SILENT fail-open here would disable the limiter with no
    // trace (the insert never accrues, the counts stay null → 0).
    if (ins.error) console.error('rate limit insert failed (failing open):', ins.error.message);

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [deviceHour, deviceDay, ipHour] = await Promise.all([
      db
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'model_call')
        .eq('session_id', device)
        .gt('created_at', hourAgo),
      db
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'model_call')
        .eq('session_id', device)
        .gt('created_at', dayAgo),
      db
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'model_call')
        .eq('payload->>ip', ip)
        .gt('created_at', hourAgo),
    ]);
    for (const r of [deviceHour, deviceDay, ipHour]) {
      if (r.error) console.error('rate limit count failed (failing open):', r.error.message);
    }

    if (
      (deviceHour.count ?? 0) > DEVICE_HOURLY ||
      (deviceDay.count ?? 0) > DEVICE_DAILY ||
      (ipHour.count ?? 0) > IP_HOURLY
    ) {
      return { ok: false, message: LIMIT_MESSAGE };
    }
    return { ok: true };
  } catch (e) {
    console.error('rate limit check failed (failing open):', e);
    return { ok: true };
  }
}
