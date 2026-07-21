// Fire-and-forget anonymous event logging from the client. Never throws, never
// blocks the UI. No-ops server-side when Supabase isn't configured.

let sessionId: string | null = null;

function freshId(): string {
  // crypto.randomUUID is available in all modern browsers; fall back just in case.
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `s_${Math.floor(performance.now())}_${performance.now()}`;
}

export function getSessionId(): string {
  if (sessionId) return sessionId;
  sessionId = freshId();
  return sessionId;
}

// Anonymous DEVICE id: minted once and kept in localStorage, so the same phone
// is the same "person" across sessions without any login. Sent as x-device-id
// on model calls — it's what the server rate-limits on (lib/rateLimit.ts).
export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem('gb_device');
    if (existing) return existing;
    const id = freshId();
    localStorage.setItem('gb_device', id);
    return id;
  } catch {
    // Private mode with storage blocked: fall back to the per-session id
    // (server then effectively limits by IP for this client).
    return getSessionId();
  }
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
