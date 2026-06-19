// Fire-and-forget anonymous event logging from the client. Never throws, never
// blocks the UI. No-ops server-side when Supabase isn't configured.

let sessionId: string | null = null;

export function getSessionId(): string {
  if (sessionId) return sessionId;
  // crypto.randomUUID is available in all modern browsers; fall back just in case.
  sessionId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `s_${Math.floor(performance.now())}_${performance.now()}`;
  return sessionId;
}

export function logEvent(type: string, payload: Record<string, unknown> = {}): void {
  try {
    void fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: getSessionId(), type, payload }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never let logging break anything */
  }
}
