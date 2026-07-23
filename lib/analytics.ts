// Fire-and-forget anonymous event logging from the client. Never throws, never
// blocks the UI. No-ops server-side when Supabase isn't configured.
//
// Two sinks, one call: logEvent() writes to Supabase (the product-data
// flywheel) AND mirrors to PostHog (analytics: who/when/where, funnels,
// session replay). PostHog is env-gated on NEXT_PUBLIC_POSTHOG_KEY.

import posthog from 'posthog-js';

let sessionId: string | null = null;
let phReady = false;

// Call once on app mount (client only). Safe to call repeatedly.
// Visiting the app with ?internal=1 permanently tags this device as internal
// (us testing), so real-user dashboards can filter us out.
export function initAnalytics(): void {
  if (phReady || typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  try {
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: true,
      autocapture: true,
      persistence: 'localStorage',
    });
    // The device id is the "person": same phone = same person across visits,
    // and it matches x-device-id on model calls + Supabase rate limiting.
    posthog.identify(getDeviceId());
    try {
      if (new URL(window.location.href).searchParams.get('internal') === '1') {
        localStorage.setItem('gb_internal', '1');
      }
      if (localStorage.getItem('gb_internal') === '1') {
        posthog.register({ internal: true });
        posthog.setPersonProperties({ internal: true });
      }
    } catch { /* private mode: skip the internal tag */ }
    posthog.register({ gb_session_id: getSessionId() });
    phReady = true;
  } catch { /* analytics must never break the app */ }
}

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

// Attach the gate email to the PostHog person (device id stays the distinct
// id; the email makes the person recognizable in dashboards).
export function identifyEmail(email: string): void {
  try {
    if (phReady) posthog.setPersonProperties({ email });
  } catch { /* analytics must never break the app */ }
}

export function logEvent(type: string, payload: Record<string, unknown> = {}): void {
  try {
    if (phReady) posthog.capture(type, payload);
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
