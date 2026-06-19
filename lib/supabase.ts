// Supabase clients. Two of them, on purpose.
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// True when server-side Supabase is usable. Routes check this and no-op cleanly
// when keys aren't set, so the demo runs fine before Supabase is wired up.
export function supabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// Browser-safe client: anon key, RLS-protected. Use in client components and for
// anything tied to the logged-in student. Lazy so the app boots (and the chat
// works on just the Anthropic key) before Supabase env is configured.
export function supabaseAnon() {
  return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

// SERVER ONLY. The service role key bypasses RLS, so this must never be imported
// into a client component. Use only inside route handlers / server actions for
// trusted server work (e.g. writing miss logs). The code-reviewer flags any
// client-side reach of this as a BLOCKER.
export function supabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin() must never run in the browser.');
  }
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
