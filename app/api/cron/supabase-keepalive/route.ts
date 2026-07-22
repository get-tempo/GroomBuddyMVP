import { timingSafeEqual } from 'crypto';
import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';

// Daily keep-alive for the free-tier Supabase project, which auto-pauses after
// ~7 days idle and takes RAG + event/survey capture down SILENTLY (it has
// happened twice). Runs as a Vercel cron (see vercel.json):
//   1. Pings the database with a trivial query. The query itself counts as
//      activity, so a daily run prevents the pause from ever triggering.
//   2. If the project is unreachable (network-level failure = paused), calls
//      the Supabase Management API to restore it. That path needs a personal
//      access token in env SUPABASE_ACCESS_TOKEN (create one at
//      supabase.com/dashboard/account/tokens). Without it we still ping, we
//      just can't self-heal; the cron then logs loudly instead.
//
// Vercel sends `Authorization: Bearer ${CRON_SECRET}` when CRON_SECRET is set
// in env. Same opt-in posture as ACCESS_CODE: unset = open (harmless endpoint,
// worst case a stranger keeps our database awake), set = verified.

export const maxDuration = 30;

function cronAuthOk(req: Request): boolean {
  const secret = (process.env.CRON_SECRET ?? '').trim();
  if (!secret) return true;
  const got = Buffer.from(req.headers.get('authorization') ?? '', 'utf8');
  const want = Buffer.from(`Bearer ${secret}`, 'utf8');
  if (got.length !== want.length) return false;
  try {
    return timingSafeEqual(got, want);
  } catch {
    return false;
  }
}

// Paused projects fail at the network layer (DNS ENOTFOUND / fetch failed).
// An HTTP-level error (bad key, missing table) means the database is UP and
// restoring would be wrong; only network failures trigger the restore path.
async function pingDatabase(): Promise<{ up: boolean; detail: string }> {
  try {
    const { error } = await supabaseAdmin()
      .from('events')
      .select('id', { head: true, count: 'exact' })
      .limit(1);
    return { up: true, detail: error ? `reachable, query error: ${error.message}` : 'ok' };
  } catch (e) {
    return { up: false, detail: e instanceof Error ? e.message : String(e) };
  }
}

async function restoreProject(): Promise<string> {
  const token = (process.env.SUPABASE_ACCESS_TOKEN ?? '').trim();
  if (!token) {
    return 'SUPABASE_ACCESS_TOKEN not set; cannot auto-restore. Restore manually at supabase.com.';
  }
  const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0];
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/restore`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  // Restore is async on Supabase's side (takes a few minutes); tomorrow's run
  // verifies it worked.
  return res.ok ? 'restore requested' : `restore failed: ${res.status} ${await res.text()}`;
}

export async function GET(req: Request) {
  if (!cronAuthOk(req)) return Response.json({ ok: false }, { status: 401 });
  if (!supabaseConfigured()) return Response.json({ ok: true, skipped: 'supabase not configured' });

  const ping = await pingDatabase();
  if (ping.up) return Response.json({ ok: true, status: ping.detail });

  console.error(`supabase keepalive: project unreachable (likely paused): ${ping.detail}`);
  const restore = await restoreProject();
  console.error(`supabase keepalive: ${restore}`);
  return Response.json({ ok: false, status: 'unreachable', action: restore });
}
