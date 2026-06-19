import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';

// End-of-demo survey submit. Anonymous, no accounts. No-ops without Supabase.

type SurveyBody = {
  sessionId?: string;
  wouldUse?: string;
  whatsMissing?: string;
  wouldPay?: string;
  comment?: string;
};

export async function POST(req: Request) {
  if (!supabaseConfigured()) return Response.json({ ok: false, skipped: true });

  try {
    const b: SurveyBody = await req.json();
    await supabaseAdmin().from('survey_responses').insert({
      session_id: b.sessionId ?? 'anon',
      would_use: b.wouldUse ?? null,
      whats_missing: b.whatsMissing ?? null,
      would_pay: b.wouldPay ?? null,
      comment: b.comment ?? null,
    });
    return Response.json({ ok: true });
  } catch (e) {
    console.error('survey submit failed:', e);
    return Response.json({ ok: false }, { status: 200 });
  }
}
