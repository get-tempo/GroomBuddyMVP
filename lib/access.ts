// Server-only access gate for the pilot. A single shared code (env ACCESS_CODE)
// keeps a leaked link from burning model/embedding credits on /api/chat.
//
// Opt-in: if ACCESS_CODE is unset/empty the app is fully open (unchanged — good
// for local dev and public demos). Set ACCESS_CODE in Vercel to lock it down for
// a student cohort, then hand the code out with the link/QR.
//
// This is intentionally lightweight (one shared code, no per-student accounts).
// Rate limiting is a separate fast-follow; the code just stops casual abuse.
import { timingSafeEqual } from 'crypto';

function currentCode(): string {
  // Read at call time (not module load) so it reflects the deploy's env.
  return (process.env.ACCESS_CODE ?? '').trim();
}

// True when a code is configured and must be supplied to reach the model.
export function accessRequired(): boolean {
  return currentCode().length > 0;
}

// Constant-time compare so we don't leak the code length/prefix via timing.
// Case-insensitive on purpose: students type it on phone keyboards where
// autocapitalize fights them ("Sundance26" must match "SUNDANCE26").
export function codeOk(input: string | null | undefined): boolean {
  const code = currentCode();
  if (!code) return true; // open when no code is configured
  const a = Buffer.from((input ?? '').trim().toLowerCase(), 'utf8');
  const b = Buffer.from(code.toLowerCase(), 'utf8');
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
