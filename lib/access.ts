// Server-only access gate: an EMAIL instead of a class code (2026-07-23).
// No accounts, no passwords — the email is the whole "signup". It gates model
// spend (chat/plan/transcribe reject calls without a plausible email header)
// and doubles as lead capture (stored via /api/access -> events table).
//
// This is intentionally lightweight: any well-formed email opens the app.
// Real spend protection is the per-device/IP rate limiter (lib/rateLimit.ts);
// the gate's job is capture plus keeping fully-anonymous drive-bys out.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailOk(input: string | null | undefined): boolean {
  const e = (input ?? '').trim();
  return e.length >= 6 && e.length <= 254 && EMAIL_RE.test(e);
}

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}
