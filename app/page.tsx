'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls, type UIMessage } from 'ai';
import Markdown from 'react-markdown';
import { GROOM_STEPS, type GroomStep } from '@/data/groom-steps';
import { findStepVideo } from '@/lib/videoBank';
import { logEvent, getSessionId, getDeviceId } from '@/lib/analytics';
import { parsePlanSteps } from '@/lib/planSteps';
import { BREED_INTAKE, COAT_TYPES, COAT_TYPE_QUESTION, resolveTypedBreed, type IntakeSet } from '@/data/breed-intake';

// ============================================================
// Grooming Buddy — single-screen state machine.
// Screens: intro · home(routing) · setup(intake) · steps · detail · quick · progress(Den)
// Overlays: safety · survey · access gate
// Guided mode builds a per-dog plan via /api/plan; Quick mode is the /api/chat bot.
// ============================================================

const MASCOT = '/art/Smileydogfunny.jpg';

// shared tokens for inline styles
const INK = 'var(--ink)';
const BORDER = `2.5px solid ${INK}`;
const BORDER2 = `2px solid ${INK}`;
const BORDER3 = `3px solid ${INK}`;
const HARD = `3px 3px 0 ${INK}`;
const HARD2 = `2px 2px 0 ${INK}`;
const FFD = 'var(--font-display)'; // Baloo 2
const FFB = 'var(--font-body)'; // Nunito

const STRIPES =
  'repeating-linear-gradient(45deg,#EFE4D2,#EFE4D2 9px,#E6D8C2 9px,#E6D8C2 18px)';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Compact markdown styling so Buddy's **bold**/lists/headings render in-bubble
// instead of showing raw asterisks. Images/links are intentionally dropped:
// the only real images come from the reference-image tool, never from text.
const MD: Record<string, (p: any) => React.ReactElement> = {
  p: (p) => <p style={{ margin: '0 0 8px' }} {...p} />,
  ul: (p) => <ul style={{ margin: '4px 0 8px', paddingLeft: 18 }} {...p} />,
  ol: (p) => <ol style={{ margin: '4px 0 8px', paddingLeft: 18 }} {...p} />,
  li: (p) => <li style={{ margin: '2px 0' }} {...p} />,
  strong: (p) => <strong style={{ fontWeight: 800 }} {...p} />,
  h1: (p) => <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 15, margin: '6px 0 4px' }} {...p} />,
  h2: (p) => <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 15, margin: '6px 0 4px' }} {...p} />,
  h3: (p) => <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 14, margin: '6px 0 4px' }} {...p} />,
  a: (p) => <span {...p} />, // show link text, never a clickable/navigable URL
  code: (p) => <code style={{ background: 'var(--neutral-fill)', padding: '1px 4px', borderRadius: 4 }} {...p} />,
};
/* eslint-enable @typescript-eslint/no-explicit-any */

type Screen = 'intro' | 'home' | 'setup' | 'steps' | 'detail' | 'quick' | 'progress';
type Intake = { breed: string; coat: string; style: string };

// ---------- tiny inline icons ----------
function ChevronR({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronL({ size = 20, onClick }: { size?: number; onClick?: () => void }) {
  return (
    <svg onClick={onClick} width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ cursor: onClick ? 'pointer' : undefined }}>
      <path d="M15 6l-6 6 6 6" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
// A saved groom (active or finished). Grooms are first-class now: every built
// plan lives in a device-local list the student can leave and come back to.
type GroomRec = {
  id: string;
  dog: Intake;
  breed: string;
  plan: GroomStep[];
  done: boolean[];
  stepIdx: number;
  savedAt: number;
};

function newGroomId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `g_${Math.random().toString(36).slice(2)}`;
}

function isGroomRec(r: unknown): r is GroomRec {
  const g = r as GroomRec;
  return (
    !!g && typeof g.id === 'string' && !!g.dog &&
    Array.isArray(g.plan) && g.plan.length > 0 &&
    Array.isArray(g.done) && g.done.length === g.plan.length
  );
}

const MAX_GROOMS = 12;

// A saved Quick chat: quick questions stick around like grooms do. Inline photo
// data URLs are swapped for a "[Photo]" text part before saving — they'd blow
// the ~5MB localStorage budget in a handful of chats.
type ChatRec = { id: string; title: string; messages: UIMessage[]; savedAt: number };
const MAX_CHATS = 15;

function isChatRec(r: unknown): r is ChatRec {
  const c = r as ChatRec;
  return !!c && typeof c.id === 'string' && typeof c.title === 'string' && Array.isArray(c.messages) && c.messages.length > 0;
}

function sanitizeForSave(messages: UIMessage[]): UIMessage[] {
  return messages.map((m) => ({
    ...m,
    parts: m.parts.map((p) => {
      const url = (p as { url?: string }).url;
      return p.type === 'file' && typeof url === 'string' && url.startsWith('data:')
        ? { type: 'text' as const, text: '[Photo]' }
        : p;
    }),
  })) as UIMessage[];
}

function chatTitle(messages: UIMessage[]): string {
  for (const m of messages) {
    if (m.role !== 'user') continue;
    for (const p of m.parts) {
      if (p.type === 'text' && p.text.trim()) return p.text.trim().slice(0, 48);
    }
  }
  return 'Quick question';
}

function whenLabel(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  if (now.getTime() - ts < 48 * 3600_000) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function BuddyApp() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [stepIdx, setStepIdx] = useState(0); // fresh groom: start at step 1
  // The groom plan for the dog on the table. Generated per-dog by /api/plan from
  // the intake; falls back to the built-in canonical plan if generation fails.
  const [plan, setPlan] = useState<GroomStep[]>(GROOM_STEPS);
  const [done, setDone] = useState<boolean[]>(Array(GROOM_STEPS.length).fill(false));
  const [selStep, setSelStep] = useState(0);
  const [breed, setBreed] = useState('Goldendoodle'); // the dog on the table (set at intake)
  const [dog, setDog] = useState<Intake | null>(null); // full intake, for step-chat context
  const [groomId, setGroomId] = useState(''); // the saved groom record the current state belongs to
  const [grooms, setGrooms] = useState<GroomRec[]>([]);
  const [planLoading, setPlanLoading] = useState(false);
  const [planStreaming, setPlanStreaming] = useState(false); // steps still arriving
  const [planError, setPlanError] = useState(''); // '' = no error; otherwise the message to show
  const [showSafety, setShowSafety] = useState(false);
  const [prevScreen, setPrevScreen] = useState<Screen>('home');

  // session "portfolio" preview (no writer yet; Den shows the empty state) + survey overlay
  const [photos] = useState<string[]>([]);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Periodic feedback nudge: a little speech bubble by the 💬 nib, not a
  // takeover. Fires once a groom crosses step 3 (they've really used it, and
  // they're between steps, not mid-scissor), at most once every 2 days per
  // device, and rests a week after they actually send feedback. Tapping it
  // opens the same Feedback sheet as the nib; it also self-dismisses.
  const [showNudge, setShowNudge] = useState(false);
  const doneCountNow = done.filter(Boolean).length;
  useEffect(() => {
    if (doneCountNow < 3) return;
    try {
      const now = Date.now();
      const sentAt = Number(localStorage.getItem('gb_fb_sent_at') ?? 0);
      const nudgedAt = Number(localStorage.getItem('gb_fb_nudged_at') ?? 0);
      if (now - sentAt < 7 * 24 * 3_600_000) return;
      if (now - nudgedAt < 2 * 24 * 3_600_000) return;
      localStorage.setItem('gb_fb_nudged_at', String(now));
      setShowNudge(true);
    } catch { /* storage blocked: just never nudge */ }
  }, [doneCountNow]);
  useEffect(() => {
    if (!showNudge) return;
    const t = setTimeout(() => setShowNudge(false), 12_000);
    return () => clearTimeout(t);
  }, [showNudge]);

  // ---- groom chat: the "ask about any step" SHEET over the step list ----
  // Typing happens in the steps screen's bottom bar; the answer slides up over
  // the steps. Minimizing keeps the thread alive (the panel stays mounted,
  // hidden) and a pill above the bar restores it. A new groom resets the chat.
  const [groomChatOpen, setGroomChatOpen] = useState(false);
  const [groomChatStarted, setGroomChatStarted] = useState(false);
  const [groomAsk, setGroomAsk] = useState<{ text: string; n: number } | null>(null);
  const askFromSteps = (text: string) => {
    setGroomChatStarted(true);
    setGroomChatOpen(true);
    setGroomAsk((p) => ({ text, n: (p?.n ?? 0) + 1 }));
  };
  useEffect(() => { setGroomChatStarted(false); setGroomChatOpen(false); setGroomAsk(null); }, [groomId]);

  // Pilot access gate. null = still checking. When the deploy sets ACCESS_CODE,
  // /api/access reports required:true and we show the Gate until the student
  // enters the code (stored in localStorage). Open (no gate) when unset.
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  useEffect(() => {
    let cancel = false;
    fetch('/api/access')
      .then((r) => r.json())
      .then(({ required }: { required?: boolean }) => {
        if (cancel) return;
        setUnlocked(required ? !!localStorage.getItem('gb_access') : true);
      })
      // Fail open in the UI on a network hiccup; /api/chat still enforces server-side.
      .catch(() => { if (!cancel) setUnlocked(true); });
    return () => { cancel = true; };
  }, []);

  // ---- groom + chat persistence (no accounts): device-local LISTS ----
  // Every built plan is a saved groom (gb_grooms_v1) and every Quick chat is a
  // saved chat (gb_chats_v1). Home shows both; tapping one loads it back.
  // Runs before the deep-link effect so ?s= wins.
  const [chats, setChats] = useState<ChatRec[]>([]);
  const [chatId, setChatId] = useState(''); // the Quick chat currently open
  const hydrated = useRef(false);
  // savedAt must mean "last actually worked on", not "last opened" — otherwise
  // merely opening the app refreshes it and the 36h auto-resume gate below only
  // ever fires once. Saves in the first few seconds after mount (the mount +
  // restore re-render, before any human could interact) carry the restored
  // timestamp forward; later saves are real activity and stamp fresh.
  const restoredAt = useRef<number | null>(null);
  const mountedAt = useRef(Date.now());

  const loadRec = (rec: GroomRec) => {
    setGroomId(rec.id);
    setPlan(rec.plan);
    setDone(rec.done);
    setStepIdx(Math.min(Math.max(0, rec.stepIdx), rec.plan.length - 1));
    setSelStep(0);
    setBreed(rec.breed || rec.dog.breed);
    setDog(rec.dog);
  };

  useEffect(() => {
    try {
      let list: GroomRec[] = [];
      const raw = localStorage.getItem('gb_grooms_v1');
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed.filter(isGroomRec);
      }
      // One-time migration of the old single-groom key into the list.
      const old = localStorage.getItem('gb_state_v1');
      if (old) {
        try {
          const s = JSON.parse(old) as { plan?: GroomStep[]; done?: boolean[]; stepIdx?: number; breed?: string; dog?: Intake | null; savedAt?: number };
          if (s?.dog && Array.isArray(s.plan) && s.plan.length > 0 && Array.isArray(s.done) && s.done.length === s.plan.length) {
            list.push({ id: newGroomId(), dog: s.dog, breed: s.breed || s.dog.breed, plan: s.plan, done: s.done, stepIdx: s.stepIdx ?? 0, savedAt: s.savedAt ?? Date.now() });
          }
        } catch { /* unreadable old state: drop it */ }
        localStorage.removeItem('gb_state_v1');
      }
      list.sort((a, b) => b.savedAt - a.savedAt);
      list = list.slice(0, MAX_GROOMS);
      setGrooms(list);
      localStorage.setItem('gb_grooms_v1', JSON.stringify(list));
      // Auto-resume: the most recent groom, if unfinished and recent, drops the
      // student straight back on its step list. Older grooms wait on Home.
      const latest = list[0];
      if (latest && !latest.done.every(Boolean) && Date.now() - latest.savedAt < 36 * 60 * 60 * 1000) {
        loadRec(latest);
        restoredAt.current = latest.savedAt;
        setScreen('steps');
      }
    } catch { /* corrupted or blocked storage: just start fresh */ }
    try {
      const rawChats = localStorage.getItem('gb_chats_v1');
      if (rawChats) {
        const parsed: unknown = JSON.parse(rawChats);
        if (Array.isArray(parsed)) {
          setChats(parsed.filter(isChatRec).sort((a, b) => b.savedAt - a.savedAt).slice(0, MAX_CHATS));
        }
      }
    } catch { /* corrupted chats: start with none */ }
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Upsert the working state into its groom record on every change.
  useEffect(() => {
    if (!hydrated.current || !groomId || !dog || plan.length === 0) return;
    const settling = Date.now() - mountedAt.current < 4000;
    const savedAt = settling && restoredAt.current != null ? restoredAt.current : Date.now();
    setGrooms((prev) => {
      const rec: GroomRec = { id: groomId, dog, breed, plan, done, stepIdx, savedAt };
      const next = [rec, ...prev.filter((g) => g.id !== groomId)].slice(0, MAX_GROOMS);
      try { localStorage.setItem('gb_grooms_v1', JSON.stringify(next)); } catch { /* storage full/blocked */ }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, done, stepIdx, breed, dog, groomId]);

  const resumeGroom = (id: string) => {
    const rec = grooms.find((g) => g.id === id);
    if (!rec) return;
    loadRec(rec);
    setScreen('steps');
    logEvent('groom_resumed', { breed: rec.breed, doneCount: rec.done.filter(Boolean).length, steps: rec.plan.length });
  };
  const removeGroom = (id: string) => {
    setGrooms((prev) => {
      const next = prev.filter((g) => g.id !== id);
      try { localStorage.setItem('gb_grooms_v1', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    if (id === groomId) {
      setGroomId('');
      setDog(null);
      setPlan(GROOM_STEPS);
      setDone(Array(GROOM_STEPS.length).fill(false));
      setStepIdx(0);
    }
  };

  // ---- Quick-chat records: saved after each finished exchange ----
  const saveChat = (id: string, msgs: UIMessage[]) => {
    if (!id || msgs.length === 0) return;
    setChats((prev) => {
      const rec: ChatRec = { id, title: chatTitle(msgs), messages: sanitizeForSave(msgs), savedAt: Date.now() };
      const next = [rec, ...prev.filter((c) => c.id !== id)].slice(0, MAX_CHATS);
      try {
        localStorage.setItem('gb_chats_v1', JSON.stringify(next));
      } catch {
        // Storage full: drop the oldest half and try once more, then give up
        // quietly (the open chat still works, it just won't persist).
        const trimmed = next.slice(0, Math.max(1, Math.ceil(next.length / 2)));
        try { localStorage.setItem('gb_chats_v1', JSON.stringify(trimmed)); return trimmed; } catch { return prev; }
      }
      return next;
    });
  };
  const resumeChat = (id: string) => {
    setChatId(id);
    setScreen('quick');
    logEvent('chat_resumed', {});
  };
  const removeChat = (id: string) => {
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try { localStorage.setItem('gb_chats_v1', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    if (id === chatId) setChatId('');
  };

  // Deep-link to a screen via ?s=home|steps|detail|quick|progress
  // (handy for demos and screenshots). Runs after mount to avoid hydration drift.
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('s') as Screen | null;
    const valid: Screen[] = ['intro', 'home', 'setup', 'steps', 'detail', 'quick', 'progress'];
    if (s && valid.includes(s)) setScreen(s);
  }, []);

  const doneCount = done.filter(Boolean).length;

  // ---- navigation / handlers ----
  const goHome = () => setScreen('home');            // the routing screen (full groom vs. quick)
  const startGroom = () => { setPlanError(''); setScreen('setup'); }; // full-groom intake
  const backToList = () => setScreen('steps');
  const openDetail = (i: number) => { setSelStep(i); setScreen('detail'); logEvent('step_open', { step: i + 1, title: plan[i]?.t }); };
  // Generic chat (from Home): no step context. Step-specific questions are
  // answered inline on the Detail screen now. Every open mints/loads a chat
  // record so quick questions persist like grooms do.
  const setQuickMode = () => { setChatId(newGroomId()); setScreen('quick'); };
  // Deep links (?s=quick) skip setQuickMode; make sure a chat id exists.
  useEffect(() => {
    if (screen === 'quick' && !chatId) setChatId(newGroomId());
  }, [screen, chatId]);

  // Build the tailored plan from the intake, then drop into the step list.
  // Streamed plan build: parse complete step objects out of the partial text as
  // it arrives and render them immediately — the student is on the step list as
  // soon as step 1 exists, and the rest fill in behind a small loader row.
  const buildPlan = async (intake: Intake) => {
    setPlanLoading(true);
    setPlanError('');
    setGroomId(''); // detach from any previous groom so the save effect can't cross-write it
    setBreed(intake.breed);
    setDog(intake);
    const genericMsg = "Couldn't build the plan just now. Check your connection and tap again.";

    // Returns how many steps it managed to show. `fallback` retries on the main
    // model when the fast plan model streamed nothing usable.
    const attempt = async (fallback: boolean): Promise<number> => {
      const r = await fetch(`/api/plan${fallback ? '?m=main' : ''}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-access-code': localStorage.getItem('gb_access') ?? '',
          'x-device-id': getDeviceId(),
        },
        body: JSON.stringify(intake),
      });
      if (!r.ok) {
        // 429 (rate limit) carries student-facing copy — show it verbatim.
        let msg = genericMsg;
        if (r.status === 429) {
          try { msg = ((await r.json()) as { error?: string }).error ?? msg; } catch { /* keep generic */ }
        }
        throw new Error(msg);
      }
      if (!r.body) throw new Error(genericMsg);
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      let shown = 0;
      for (;;) {
        let chunk: ReadableStreamReadResult<Uint8Array>;
        try {
          chunk = await reader.read();
        } catch {
          break; // stream dropped mid-way: keep whatever steps already landed
        }
        const { done: streamDone, value } = chunk;
        if (streamDone) break;
        text += decoder.decode(value, { stream: true });
        const steps = parsePlanSteps(text).slice(0, 12);
        if (steps.length > shown) {
          setPlan(steps);
          if (shown === 0) {
            // First step landed: this is now a real saved groom. Reset progress
            // and go; the list grows in place.
            setGroomId(newGroomId());
            setDone(Array(steps.length).fill(false));
            setStepIdx(0);
            setSelStep(0);
            setPlanLoading(false);
            setPlanStreaming(true);
            setScreen('steps');
          } else {
            // Grow `done` without clobbering boxes ticked while streaming.
            setDone((prev) => {
              const next = prev.slice();
              while (next.length < steps.length) next.push(false);
              return next;
            });
          }
          shown = steps.length;
        }
      }
      return shown;
    };

    try {
      let shown = await attempt(false);
      if (shown === 0) shown = await attempt(true); // fast model gave nothing — retry on main
      if (shown === 0) throw new Error(genericMsg);
      logEvent('plan_built', { breed: intake.breed, coat: intake.coat, style: intake.style, steps: shown });
    } catch (e) {
      setPlanError(e instanceof Error && e.message ? e.message : genericMsg);
      setScreen('setup'); // in case a partial stream already navigated away
    } finally {
      setPlanLoading(false);
      setPlanStreaming(false);
    }
  };

  // "Got it" applies to the step being VIEWED (selStep), not the sequential
  // pointer. Finishing step 5 means 1-5 are done (you did them to get there);
  // re-viewing an already-done step marks nothing extra.
  const gotItNext = () => {
    const d = done.slice();
    if (!d[selStep]) for (let k = 0; k <= selStep; k++) d[k] = true;
    setDone(d);
    setStepIdx(Math.min(selStep + 1, plan.length - 1));
    setScreen('steps');
    if (d.every(Boolean)) { logEvent('groom_complete', {}); setShowSurvey(true); }
  };
  const goDen = () => { setPrevScreen(screen); setScreen('progress'); };
  const backFromDen = () => setScreen(prevScreen || 'home');
  const triggerSafety = () => { setShowSafety(true); logEvent('safety', {}); };
  const stoppedGetHelp = () => { setShowSafety(false); setScreen('home'); };

  if (unlocked === null) return <div className="app" />; // brief blank while we check the gate
  if (!unlocked) return <div className="app"><Gate onUnlock={() => setUnlocked(true)} /></div>;

  return (
    <div className="app">
      {/* status-bar notch breathing room is built into each screen's top padding */}
      {screen === 'intro' && <Intro letsGroom={goHome} />}
      {screen === 'home' && (
        <Home goDen={goDen} startGroom={startGroom} setQuickMode={setQuickMode} grooms={grooms} chats={chats} resumeGroom={resumeGroom} removeGroom={removeGroom} resumeChat={resumeChat} removeChat={removeChat} />
      )}
      {screen === 'setup' && (
        <Setup back={goHome} onBuild={buildPlan} loading={planLoading} error={planError} />
      )}
      {screen === 'steps' && (
        <Steps breed={breed} styleLabel={dog?.style ?? ''} steps={plan} doneCount={doneCount} done={done} stepIdx={stepIdx} streaming={planStreaming} chatStarted={groomChatStarted} goHome={goHome} openDetail={openDetail} onAsk={askFromSteps} openChat={() => setGroomChatOpen(true)} />
      )}
      {screen === 'detail' && (
        <Detail step={plan[selStep] || plan[0]} i={selStep} total={plan.length} breed={breed} dog={dog} backToList={backToList} gotItNext={gotItNext} />
      )}
      {screen === 'quick' && chatId && (
        // key: switching chats must remount so useChat starts from the record.
        <Quick key={chatId} goHome={goHome} triggerSafety={triggerSafety} breed={breed} initialMessages={chats.find((c) => c.id === chatId)?.messages} onMessages={(m) => saveChat(chatId, m)} />
      )}
      {screen === 'progress' && <Den backFromDen={backFromDen} photos={photos} openSurvey={() => setShowSurvey(true)} />}

      {/* groom chat sheet: mounted from first question until the groom changes,
          hidden (not unmounted) when minimized so the thread survives */}
      {groomChatStarted && (
        <div
          onClick={() => setGroomChatOpen(false)}
          style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'rgba(43,33,26,.45)', display: screen === 'steps' && groomChatOpen ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'flex-end' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--cream)', borderTop: BORDER3, borderRadius: '28px 28px 0 0', height: '84%', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'gbSlideUp .3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px 8px' }}>
              <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 16, color: INK }}>Buddy, about this groom</div>
              <button onClick={() => setGroomChatOpen(false)} aria-label="Minimize chat" style={{ border: BORDER2, background: '#fff', borderRadius: 12, width: 34, height: 30, cursor: 'pointer', fontFamily: FFD, fontWeight: 800, fontSize: 15, color: INK, lineHeight: 1, padding: 0 }}>˅</button>
            </div>
            <ChatPanel
              key={groomId || 'nogroom'}
              context={`The student is mid guided groom on ${dog ? `a ${dog.breed}, coat: ${dog.coat}, going for ${dog.style}` : `a ${breed}`}. The plan: ${plan.map((s, i) => `${i + 1}. ${s.t}${done[i] ? ' (done)' : ''}`).join('; ')}. They are on step ${stepIdx + 1}. They may ask about ANY step; answer with the school's method for THIS dog. They may send a photo of where they're at.`}
              intro={<span>Ask me about any step of this groom, or snap a pic with the ➕ and I&apos;ll take a look.</span>}
              ask={groomAsk}
              onAskConsumed={() => setGroomAsk(null)}
              chips={({ prefill }) => (
                <>
                  <QuickChip label="Is this okay?" onClick={() => prefill('Is this okay? ')} />
                  <QuickChip label="How do I…" onClick={() => prefill('How do I ')} />
                  <QuickChip label="Show me a reference" onClick={() => prefill('Show me a reference photo of ')} />
                </>
              )}
            />
          </div>
        </div>
      )}

      {/* persistent, out-of-the-way feedback nib (sits in the empty status-bar strip) */}
      {!showFeedback && !showSurvey && !showSafety && (
        <>
          <button
            onClick={() => setShowFeedback(true)}
            aria-label="Give feedback"
            // Lives entirely inside the empty status strip (every screen's own
            // content starts at y=34+), so it can't overlap header rows/badges.
            // aspectRatio + border-box pin it to a true circle (button UA
            // styles were stretching it slightly wider than tall).
            style={{ position: 'absolute', top: 4, right: 10, zIndex: 60, width: 28, height: 28, aspectRatio: '1 / 1', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: BORDER2, background: '#fff', boxShadow: HARD2, cursor: 'pointer', fontSize: 13, lineHeight: 1, opacity: 0.9, padding: 0 }}
          >
            💬
          </button>
          {showNudge && (
            <div
              onClick={() => { setShowNudge(false); setShowFeedback(true); }}
              role="button"
              style={{ position: 'absolute', top: 38, right: 10, zIndex: 60, maxWidth: 216, background: '#fff', border: BORDER2, borderRadius: '14px 4px 14px 14px', padding: '9px 26px 9px 11px', boxShadow: HARD2, fontFamily: FFB, fontWeight: 800, fontSize: 12.5, lineHeight: 1.35, color: INK, cursor: 'pointer', animation: 'gbPop .25s ease' }}
            >
              Leave us a quick note so Buddy keeps getting better 🐾
              <button
                onClick={(e) => { e.stopPropagation(); setShowNudge(false); }}
                aria-label="Dismiss"
                style={{ position: 'absolute', top: 4, right: 6, border: 'none', background: 'transparent', fontWeight: 900, fontSize: 14, color: 'var(--muted-2)', cursor: 'pointer', lineHeight: 1, padding: 2 }}
              >
                ×
              </button>
            </div>
          )}
        </>
      )}

      {showSafety && <Safety stoppedGetHelp={stoppedGetHelp} closeSafety={() => setShowSafety(false)} />}
      {showSurvey && <Survey sessionId={getSessionId()} close={() => setShowSurvey(false)} />}
      {showFeedback && <Feedback close={() => setShowFeedback(false)} />}
    </div>
  );
}

// ============================================================
// Access gate — shown only when the deploy sets ACCESS_CODE. One shared class
// code unlocks the app and is stored locally + sent with every chat request.
// ============================================================
function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const c = code.trim();
    if (!c || busy) return;
    setBusy(true);
    setErr(false);
    try {
      const r = await fetch('/api/access', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: c }),
      });
      const { ok } = (await r.json()) as { ok?: boolean };
      if (ok) {
        localStorage.setItem('gb_access', c);
        onUnlock();
      } else {
        setErr(true);
      }
    } catch {
      setErr(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="scr" style={{ alignItems: 'center', justifyContent: 'center', padding: '24px', gap: 0 }}>
      <div style={{ animation: 'gbFloat 3s ease-in-out infinite' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MASCOT} alt="Buddy" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '5px solid var(--ink)', background: '#fff' }} />
      </div>
      <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 24, color: INK, marginTop: 18, textAlign: 'center' }}>Enter your class code</div>
      <div style={{ fontFamily: FFB, fontWeight: 700, fontSize: 14, color: 'var(--muted-2)', marginTop: 6, textAlign: 'center' }}>Your instructor gave you this.</div>
      <input
        value={code}
        onChange={(e) => { setCode(e.target.value); setErr(false); }}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder="class code"
        autoCapitalize="none"
        autoCorrect="off"
        style={{ width: '100%', marginTop: 22, background: '#fff', border: err ? `2.5px solid var(--coral)` : BORDER, borderRadius: 16, padding: '15px 16px', fontFamily: FFB, fontWeight: 700, fontSize: 17, color: INK, boxShadow: HARD, outline: 'none', textAlign: 'center' }}
      />
      {err && <div style={{ fontFamily: FFB, fontWeight: 700, fontSize: 13, color: 'var(--coral)', marginTop: 10 }}>That code didn&apos;t work. Check with your instructor.</div>}
      <button
        onClick={submit}
        disabled={busy}
        style={{ width: '100%', marginTop: 16, background: 'var(--primary)', border: BORDER, borderRadius: 18, padding: 16, fontFamily: FFD, fontWeight: 800, fontSize: 18, color: INK, boxShadow: HARD, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}
      >
        {busy ? 'Checking…' : "Let me in →"}
      </button>
    </div>
  );
}

async function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// iPhones shoot HEIC by default, and most browsers (and the vision model) can't
// read it. Convert HEIC -> JPEG in the browser before we preview or send, so a
// photo from any phone just works. Non-HEIC files pass straight through.
async function fileToImageDataUrl(file: File): Promise<{ url: string; mediaType: string }> {
  const isHeic = /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
  if (isHeic) {
    try {
      const heic2any = (await import('heic2any')).default;
      const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
      const blob = (Array.isArray(out) ? out[0] : out) as Blob;
      return { url: await fileToDataUrl(blob), mediaType: 'image/jpeg' };
    } catch {
      // Conversion failed: fall back to the raw file rather than dropping it.
    }
  }
  return { url: await fileToDataUrl(file), mediaType: file.type || 'image/jpeg' };
}

// Free, instant, on-device photo quality check (no AI, no network). Flags only
// CLEARLY dark or blurry shots so we can nudge a retake. Thresholds are
// deliberately lenient — this never blocks sending, it just suggests. Tune if
// it over- or under-fires on real salon photos.
async function analyzeImage(dataUrl: string): Promise<{ dark: boolean; blurry: boolean }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, 256 / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve({ dark: false, blurry: false });
      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);

      const gray = new Float64Array(w * h);
      let sum = 0;
      for (let i = 0; i < w * h; i++) {
        const lum = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
        gray[i] = lum;
        sum += lum;
      }
      const mean = sum / (w * h); // 0 (black) .. 255 (white)

      // Sharpness = variance of the Laplacian. Low variance => soft/blurry.
      let lSum = 0;
      let lSq = 0;
      let n = 0;
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          const lap = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - w] - gray[i + w];
          lSum += lap;
          lSq += lap * lap;
          n++;
        }
      }
      const lVar = n ? lSq / n - (lSum / n) ** 2 : 0;

      resolve({ dark: mean < 50, blurry: lVar < 40 });
    };
    img.onerror = () => resolve({ dark: false, blurry: false });
    img.src = dataUrl;
  });
}

// ============================================================
// SCREEN 1 — Intro
// ============================================================
function Intro({ letsGroom }: { letsGroom: () => void }) {
  const row = (n: number, bg: string, txt: string, label: string) => (
    <div style={{ display: 'flex', gap: 13, alignItems: 'center', background: '#fff', border: BORDER, borderRadius: 18, padding: '14px 15px', boxShadow: HARD }}>
      <div style={{ flex: 'none', width: 38, height: 38, borderRadius: 11, background: bg, border: BORDER2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FFD, fontWeight: 800, fontSize: 18, color: txt }}>{n}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: INK, lineHeight: 1.25 }}>{label}</div>
    </div>
  );
  return (
    <div className="scr" style={{ alignItems: 'center', padding: '64px 24px 24px' }}>
      <div style={{ position: 'relative', animation: 'gbWiggle 2.6s ease-in-out infinite' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MASCOT} alt="Buddy" style={{ width: 128, height: 128, borderRadius: '50%', objectFit: 'cover', border: '5px solid var(--ink)', background: '#fff' }} />
        <div style={{ position: 'absolute', top: -8, right: -10, background: 'var(--coral)', color: '#fff', fontFamily: FFD, fontWeight: 800, fontSize: 14, padding: '4px 11px', borderRadius: 13, border: BORDER }}>hi! 👋</div>
      </div>
      <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 27, color: INK, marginTop: 20, textAlign: 'center', lineHeight: 1.1 }}>I&apos;m Buddy.<br />Here&apos;s what I do →</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13, width: '100%', marginTop: 26 }}>
        {row(1, 'var(--primary)', INK, 'Walk you through the whole groom, step by step')}
        {row(2, 'var(--coral)', '#fff', 'Look at your photo & coach you, never grade you')}
        {row(3, 'var(--green)', '#fff', 'Tell you when to pause & grab a human')}
      </div>
      <div style={{ marginTop: 'auto', width: '100%', display: 'flex', gap: 10, alignItems: 'center' }}>
        <button onClick={letsGroom} style={{ flex: 'none', background: 'transparent', border: 'none', fontFamily: FFB, fontWeight: 700, fontSize: 15, color: 'var(--muted-2)', padding: '16px 8px', cursor: 'pointer' }}>Skip</button>
        <button onClick={letsGroom} style={{ flex: 1, background: 'var(--primary)', border: BORDER, borderRadius: 18, padding: 16, fontFamily: FFD, fontWeight: 800, fontSize: 18, color: INK, boxShadow: HARD, cursor: 'pointer' }}>Let&apos;s groom →</button>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 2 — Home / routing: "what are we doing today?"
// ============================================================
function Home({ goDen, startGroom, setQuickMode, grooms, chats, resumeGroom, removeGroom, resumeChat, removeChat }: { goDen: () => void; startGroom: () => void; setQuickMode: () => void; grooms: GroomRec[]; chats: ChatRec[]; resumeGroom: (id: string) => void; removeGroom: (id: string) => void; resumeChat: (id: string) => void; removeChat: (id: string) => void }) {
  const empty = grooms.length === 0 && chats.length === 0;
  return (
    <div className="scr" style={{ padding: '0 18px' }}>
      {/* topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '34px 0 10px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img onClick={goDen} src={MASCOT} alt="Buddy" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: BORDER, background: '#fff', cursor: 'pointer' }} />
        <div onClick={goDen} style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '.05em' }}>preview</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--green)', border: BORDER, borderRadius: 999, padding: '5px 11px', fontFamily: FFD, fontWeight: 800, fontSize: 14, color: '#fff' }}>7🔥</div>
        </div>
      </div>

      <div style={{ padding: '18px 0 6px' }}>
        <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 26, color: INK, lineHeight: 1.1 }}>Your grooms</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted-1)', marginTop: 5 }}>
          {empty ? 'Nothing here yet. Tap New groom and we’ll get started.' : 'Tap one to jump back in.'}
        </div>
      </div>

      {!empty && (
        // Grooms + saved chats share one scroll area; the buttons below stay
        // put no matter how long this gets.
        <div className="gbsc" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12, overflowY: 'auto', flex: 1, minHeight: 0, paddingBottom: 6 }}>
          {grooms.map((g) => {
            const doneN = g.done.filter(Boolean).length;
            const complete = doneN === g.plan.length;
            return (
              <div key={g.id} onClick={() => resumeGroom(g.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: complete ? '#fff' : 'var(--primary-soft)', border: complete ? BORDER : BORDER3, borderRadius: 16, padding: '12px 13px', boxShadow: complete ? 'none' : HARD2, cursor: 'pointer', opacity: complete ? 0.75 : 1 }}>
                <div style={{ flex: 'none', width: 40, height: 40, borderRadius: 12, background: complete ? 'var(--green)' : 'var(--primary)', border: BORDER2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>
                  {complete ? '✓' : '🐶'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 15.5, color: INK, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.breed}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {complete ? `Done · ${g.dog.style}` : `Step ${Math.min(doneN + 1, g.plan.length)} of ${g.plan.length} · ${g.dog.style}`}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeGroom(g.id); }}
                  aria-label="Remove groom"
                  style={{ flex: 'none', border: 'none', background: 'transparent', fontWeight: 900, fontSize: 16, color: 'var(--muted-2)', cursor: 'pointer', lineHeight: 1, padding: 6 }}
                >
                  ×
                </button>
              </div>
            );
          })}

          {chats.length > 0 && (
            <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 16, color: INK, margin: '8px 0 0' }}>Quick questions</div>
          )}
          {chats.map((c) => (
            <div key={c.id} onClick={() => resumeChat(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: BORDER, borderRadius: 16, padding: '12px 13px', cursor: 'pointer' }}>
              <div style={{ flex: 'none', width: 40, height: 40, borderRadius: 12, background: 'var(--coral)', border: BORDER2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
                💬
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 15, color: INK, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted-1)' }}>{whenLabel(c.savedAt)}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeChat(c.id); }}
                aria-label="Remove chat"
                style={{ flex: 'none', border: 'none', background: 'transparent', fontWeight: 900, fontSize: 16, color: 'var(--muted-2)', cursor: 'pointer', lineHeight: 1, padding: 6 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {empty ? (
        <>
          {/* first run: two big plain-text choices, no emoji clutter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
            <button onClick={startGroom} style={{ textAlign: 'left', background: 'var(--primary)', border: BORDER, borderRadius: 20, padding: '22px 20px', boxShadow: HARD, cursor: 'pointer' }}>
              <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 23, color: INK, lineHeight: 1.1 }}>New groom</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#4A3C30', marginTop: 6, lineHeight: 1.35 }}>Tell me the dog and I&apos;ll build a step-by-step plan just for them.</div>
            </button>
            <button onClick={setQuickMode} style={{ textAlign: 'left', background: 'var(--coral)', border: BORDER, borderRadius: 20, padding: '22px 20px', boxShadow: HARD, cursor: 'pointer' }}>
              <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 23, color: '#fff', lineHeight: 1.1 }}>Quick question</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.92)', marginTop: 6, lineHeight: 1.35 }}>Stuck on one thing? Ask me or send a photo and I&apos;ll coach you.</div>
            </button>
          </div>
          <div style={{ flex: 1 }} />
        </>
      ) : (
        <div style={{ display: 'flex', gap: 10, padding: '12px 0 4px' }}>
          <button onClick={startGroom} style={{ flex: 1, background: 'var(--primary)', border: BORDER, borderRadius: 16, padding: 16, fontFamily: FFD, fontWeight: 800, fontSize: 17, color: INK, boxShadow: HARD2, cursor: 'pointer' }}>New groom</button>
          <button onClick={setQuickMode} style={{ flex: 1, background: 'var(--coral)', border: BORDER, borderRadius: 16, padding: 16, fontFamily: FFD, fontWeight: 800, fontSize: 17, color: '#fff', boxShadow: HARD2, cursor: 'pointer' }}>Quick question</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SCREEN 2b — Guided intake: breed + coat + style -> build the plan
// ============================================================
const BREEDS = ['Goldendoodle', 'Labradoodle', 'Poodle', 'Golden Retriever', 'Shih Tzu', 'Yorkie', 'Maltese', 'Bichon', 'Schnauzer', 'Cocker Spaniel', 'Doodle mix'];
const OTHER = '__other';

// Progressive intake: breed first, then the questions that make sense for THAT
// dog appear as you answer (a Golden gets a shedding question and a service
// menu; a doodle gets the matting scale and clip styles; see data/breed-intake).
// Unknown mixes: typed text resolves via a synonym table, else a coat-type
// question stands in for breed, since coat drives the groom anyway.
function Setup({ back, onBuild, loading, error }: { back: () => void; onBuild: (i: Intake) => void; loading: boolean; error: string }) {
  const [breed, setBreed] = useState('');
  const [breedOther, setBreedOther] = useState('');
  const [coatType, setCoatType] = useState(''); // unknown-mix path only
  const [coat, setCoat] = useState('');
  const [coatOther, setCoatOther] = useState('');
  const [style, setStyle] = useState('');
  const [styleOther, setStyleOther] = useState('');

  // Which question set is live right now?
  const typedSet = breed === OTHER ? resolveTypedBreed(breedOther) : null;
  const set: IntakeSet | null =
    breed && breed !== OTHER
      ? BREED_INTAKE[breed] ?? null
      : breed === OTHER
        ? typedSet ?? COAT_TYPES.find((c) => c.label === coatType)?.set ?? null
        : null;

  const resetAnswers = () => { setCoat(''); setCoatOther(''); setStyle(''); setStyleOther(''); };
  const pickBreed = (b: string) => { setBreed(b); setCoatType(''); resetAnswers(); };
  const typeBreed = (v: string) => { setBreedOther(v); resetAnswers(); }; // typing can swap the set
  const pickCoatType = (l: string) => { setCoatType(l); resetAnswers(); };

  const finalBreed =
    breed === OTHER
      ? breedOther.trim() || (coatType ? `Mixed breed with a ${coatType.toLowerCase()} coat` : '')
      : breed;
  const finalCoat = coat === OTHER ? coatOther.trim() : coat;
  // For the coat-type path, carry the type into the plan intake too.
  const coatForPlan = breed === OTHER && coatType && !typedSet && finalCoat ? `${coatType}; ${finalCoat}` : finalCoat;
  const finalStyle = style === OTHER ? styleOther.trim() : style;
  const ready = !!finalBreed && !!set && !!finalCoat && !!finalStyle && !loading;

  const chip = (label: string, active: boolean, onClick: () => void) => (
    <div key={label} onClick={onClick} style={{ background: active ? 'var(--primary)' : '#fff', border: active ? BORDER3 : BORDER, borderRadius: 999, padding: '9px 14px', fontFamily: FFD, fontWeight: 800, fontSize: 13.5, color: INK, cursor: 'pointer', boxShadow: active ? HARD2 : 'none' }}>{label}</div>
  );
  const otherInput = (val: string, set: (v: string) => void, placeholder: string) => (
    <input
      value={val}
      onChange={(e) => set(e.target.value)}
      placeholder={placeholder}
      autoCapitalize="none"
      style={{ width: '100%', marginTop: 10, background: '#fff', border: BORDER, borderRadius: 14, padding: '12px 14px', fontFamily: FFB, fontWeight: 700, fontSize: 15, color: INK, boxShadow: HARD2, outline: 'none' }}
    />
  );
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 15, color: INK, marginBottom: 9 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="scr" style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MASCOT} alt="Buddy" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '5px solid var(--ink)', background: '#fff', animation: 'gbFloat 2s ease-in-out infinite' }} />
        <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 20, color: INK, marginTop: 20, textAlign: 'center' }}>Building your plan…</div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted-1)', marginTop: 6, textAlign: 'center' }}>Reading the book for {finalBreed || 'this dog'} and making it fit.</div>
        <div style={{ display: 'flex', gap: 5, marginTop: 18 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--primary)', animation: 'gbType 1.2s infinite' }} />
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--primary)', animation: 'gbType 1.2s infinite .2s' }} />
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--primary)', animation: 'gbType 1.2s infinite .4s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="scr">
      <div style={{ padding: '38px 18px 12px', background: 'var(--primary)', borderBottom: BORDER, display: 'flex', alignItems: 'center', gap: 10 }}>
        <ChevronL size={22} onClick={back} />
        <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 19, color: INK }}>Who&apos;s on the table?</div>
      </div>
      <div className="gbsc scroll" style={{ padding: '4px 18px 18px' }}>
        <Section title="Breed">
          {BREEDS.map((b) => chip(b, breed === b, () => pickBreed(b)))}
          {chip('Other / mixed', breed === OTHER, () => pickBreed(OTHER))}
        </Section>
        {breed === OTHER && otherInput(breedOther, typeBreed, 'What mix, if you know? e.g. Cavapoo…')}
        {breed === OTHER && !typedSet && (
          <Section title={COAT_TYPE_QUESTION}>
            {COAT_TYPES.map((c) => chip(c.label, coatType === c.label, () => pickCoatType(c.label)))}
          </Section>
        )}
        {set && (
          <Section title={set.coatTitle}>
            {set.coats.map((c) => chip(c, coat === c, () => setCoat(c)))}
            {chip('Other', coat === OTHER, () => setCoat(OTHER))}
          </Section>
        )}
        {set && coat === OTHER && otherInput(coatOther, setCoatOther, 'e.g. greasy, shedding a lot…')}
        {set && !!finalCoat && (
          <Section title={set.styleTitle}>
            {set.styles.map((s) => chip(s, style === s, () => setStyle(s)))}
            {chip('Other', style === OTHER, () => setStyle(OTHER))}
          </Section>
        )}
        {set && !!finalCoat && style === OTHER && otherInput(styleOther, setStyleOther, 'e.g. lion cut, lamb, kennel cut…')}
        {!!error && (
          <div style={{ marginTop: 18, background: 'var(--red-tint)', border: BORDER, borderRadius: 14, padding: 12, fontSize: 13, fontWeight: 700, color: 'var(--red-text)' }}>
            {error}
          </div>
        )}
      </div>
      <div style={{ padding: '13px 18px 22px', borderTop: BORDER, background: '#fff' }}>
        <button
          onClick={() => ready && onBuild({ breed: finalBreed, coat: coatForPlan, style: finalStyle })}
          disabled={!ready}
          style={{ width: '100%', background: ready ? 'var(--primary)' : 'var(--neutral-fill)', border: BORDER, borderRadius: 16, padding: 16, fontFamily: FFD, fontWeight: 800, fontSize: 17, color: ready ? INK : 'var(--muted-2)', boxShadow: ready ? HARD : 'none', cursor: ready ? 'pointer' : 'default' }}
        >
          Build my plan →
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 3 — Steps list
// ============================================================
function Steps({ breed, styleLabel, steps, doneCount, done, stepIdx, streaming, chatStarted, goHome, openDetail, onAsk, openChat }: { breed: string; styleLabel: string; steps: GroomStep[]; doneCount: number; done: boolean[]; stepIdx: number; streaming: boolean; chatStarted: boolean; goHome: () => void; openDetail: (i: number) => void; onAsk: (text: string) => void; openChat: () => void }) {
  // The ask bar: type here, the answer opens as a sheet OVER the steps.
  const [ask, setAsk] = useState('');
  const askRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = askRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 90)}px`;
    el.style.overflowY = el.scrollHeight > 90 ? 'auto' : 'hidden';
  }, [ask]);
  const sendAsk = () => {
    const t = ask.trim();
    if (!t) return;
    onAsk(t);
    setAsk('');
  };
  return (
    <div className="scr">
      <div style={{ padding: '38px 18px 12px', background: 'var(--primary)', borderBottom: BORDER }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ChevronL size={22} onClick={goHome} />
            <div>
              <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 19, color: INK, lineHeight: 1 }}>{breed}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-deep)' }}>{styleLabel ? `Full groom · ${styleLabel}` : 'Full groom'}</div>
            </div>
          </div>
          <div style={{ background: INK, color: 'var(--primary)', fontFamily: FFD, fontWeight: 800, fontSize: 14, padding: '6px 11px', borderRadius: 12 }}>{doneCount}/{steps.length}</div>
        </div>
      </div>
      <div className="gbsc scroll" style={{ padding: '14px 16px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((st, i) => {
          const isDone = done[i];
          const isCurrent = i === stepIdx && !done[i];
          if (isDone) {
            return (
              <div key={i} onClick={() => openDetail(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: BORDER, borderRadius: 14, padding: '12px 13px', opacity: 0.55, cursor: 'pointer' }}>
                <div style={{ flex: 'none', width: 28, height: 28, borderRadius: '50%', background: 'var(--green)', border: BORDER2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: INK, textDecoration: 'line-through' }}>{st.t}</div>
              </div>
            );
          }
          if (isCurrent) {
            return (
              <div key={i} onClick={() => openDetail(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--primary-soft)', border: BORDER3, borderRadius: 16, padding: 13, boxShadow: HARD, cursor: 'pointer' }}>
                <div style={{ flex: 'none', width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', border: BORDER, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FFD, fontWeight: 800, fontSize: 14, color: INK }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 16, color: INK, lineHeight: 1 }}>{st.t}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-gold)' }}>You&apos;re here · tap for the how-to</div>
                </div>
                <ChevronR />
              </div>
            );
          }
          return (
            <div key={i} onClick={() => openDetail(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: BORDER, borderRadius: 14, padding: '12px 13px', cursor: 'pointer' }}>
              <div style={{ flex: 'none', width: 28, height: 28, borderRadius: '50%', background: 'var(--neutral-fill)', border: BORDER2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FFD, fontWeight: 800, fontSize: 13, color: 'var(--muted-2)' }}>{i + 1}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: INK }}>{st.t}</div>
            </div>
          );
        })}
        {streaming && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', fontSize: 13, fontWeight: 700, color: 'var(--muted-2)' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', animation: 'gbType 1.2s infinite' }} />
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', animation: 'gbType 1.2s infinite .2s' }} />
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', animation: 'gbType 1.2s infinite .4s' }} />
            </div>
            Buddy&apos;s writing the rest of the plan…
          </div>
        )}
      </div>
      <div style={{ padding: '10px 18px 22px', borderTop: BORDER, background: '#fff' }}>
        {chatStarted && (
          <div onClick={openChat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8, background: 'var(--primary-soft)', border: BORDER2, borderRadius: 999, padding: '7px 12px', fontFamily: FFD, fontWeight: 800, fontSize: 12.5, color: INK, cursor: 'pointer' }}>
            <span style={{ fontSize: 14 }}>˄</span> Your chat with Buddy is here
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <textarea
            ref={askRef}
            className="gbin"
            value={ask}
            rows={1}
            onChange={(e) => setAsk(e.target.value)}
            placeholder="Ask about any step…"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAsk(); } }}
            style={{ flex: 1, background: 'var(--neutral-fill)', border: BORDER, borderRadius: 14, padding: 12, fontWeight: 700, fontSize: 13.5, color: INK, fontFamily: FFB, outline: 'none', resize: 'none', overflowY: 'hidden', lineHeight: 1.4, maxHeight: 90 }}
          />
          <button
            onClick={sendAsk}
            disabled={!ask.trim()}
            aria-label="Ask"
            style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', background: 'var(--coral)', border: BORDER3, boxShadow: HARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: ask.trim() ? 'pointer' : 'default', opacity: ask.trim() ? 1 : 0.4 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h13M12 5l7 7-7 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 4 — Step detail (core value screen)
// ============================================================
function Detail({ step, i, total, breed, dog, backToList, gotItNext }: { step: GroomStep; i: number; total: number; breed: string; dog: Intake | null; backToList: () => void; gotItNext: () => void }) {
  const d = step;
  // Inline step chat: the answer shows up right here on the step, not on the
  // Quick tab. Closed by default; state resets naturally when the step changes.
  const [chatOpen, setChatOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => setChatOpen(false), [i]);
  const who = dog ? `a ${dog.breed}, coat: ${dog.coat}, going for ${dog.style}` : `a ${breed}`;
  const stepCtx = `The student is doing a full guided groom on ${who} and is on step ${i + 1} of ${total}: "${d.t}" (${d.quickRead}). Answer about THIS step specifically. They may send a photo of their progress on it.`;
  // Show an approved technique video for this step if one clearly matches;
  // otherwise show nothing (no empty "reference goes here" placeholder).
  const video = findStepVideo(`${d.t} ${d.ref} ${breed}`);
  return (
    <div className="scr">
      <div style={{ padding: '38px 18px 12px', background: 'var(--primary)', borderBottom: BORDER, display: 'flex', alignItems: 'center', gap: 10 }}>
        <ChevronL onClick={backToList} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--gold-deep)' }}>STEP {i + 1} OF {total}</div>
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 20, color: INK, lineHeight: 1 }}>{d.t}</div>
        </div>
      </div>
      <div ref={contentRef} className="gbsc scroll" style={{ padding: '16px 16px 22px', display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div style={{ background: '#fff', border: BORDER, borderRadius: 16, padding: 14, boxShadow: HARD }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: INK, lineHeight: 1.45 }}>{d.quickRead}</div>
        </div>
        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
          <div style={{ flex: 'none', width: 30, height: 30, borderRadius: 9, background: 'var(--primary)', border: BORDER2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div>
            <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 14, color: INK }}>Do this next</div>
            <ol style={{ margin: '3px 0 0', paddingLeft: 18, fontSize: 13, fontWeight: 600, color: '#4A3C30', lineHeight: 1.4 }}>
              {(Array.isArray(d.doNext) ? d.doNext : [d.doNext]).map((s, k) => (
                <li key={k} style={{ margin: '0 0 4px' }}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
          <div style={{ flex: 'none', width: 30, height: 30, borderRadius: 9, background: 'var(--coral)', border: BORDER2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: FFD, fontWeight: 800, color: '#fff', fontSize: 15 }}>!</span>
          </div>
          <div>
            <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 14, color: INK }}>Pro tip</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4A3C30', lineHeight: 1.4 }}>{d.cue}</div>
          </div>
        </div>
        {video && (
          <figure style={{ margin: 0 }}>
            <div style={{ border: BORDER, borderRadius: 14, overflow: 'hidden', position: 'relative', paddingTop: '56.25%', background: '#000' }}>
              <iframe
                src={(() => {
                  const p = new URLSearchParams({ rel: '0' });
                  if (video.start) p.set('start', String(video.start));
                  if (video.end) p.set('end', String(video.end));
                  return `https://www.youtube-nocookie.com/embed/${video.youtubeId}?${p}`;
                })()}
                title={video.title}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            </div>
            <figcaption style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-1)', marginTop: 6 }}>
              ▶ {video.title}{video.duration ? ` · ${video.duration}` : ''}
            </figcaption>
          </figure>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, background: 'var(--green-tint)', border: BORDER, borderRadius: 14, padding: 12 }}>
            <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 13, color: 'var(--green-text)' }}>Good looks like</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-text-2)', lineHeight: 1.35, marginTop: 3 }}>{d.good}</div>
          </div>
          <div style={{ flex: 1, background: 'var(--red-tint)', border: BORDER, borderRadius: 14, padding: 12 }}>
            <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 13, color: 'var(--red-text)' }}>Watch out</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--red-text-2)', lineHeight: 1.35, marginTop: 3 }}>{d.watch}</div>
          </div>
        </div>
        {/* Depth on demand: contextual chat about THIS step, answered in place.
            Opened from the always-visible Ask Buddy half of the bottom bar. */}
        {chatOpen && (
          <div style={{ background: '#fff', border: BORDER, borderRadius: 16, padding: 12, boxShadow: HARD }}>
            <ChatPanel
              compact
              context={stepCtx}
              intro={<span>You&apos;re on <strong>{d.t}</strong>. Ask me anything about it, or snap a pic of where you&apos;re at with the ➕ and I&apos;ll take a look.</span>}
              chips={({ deliver, prefill, busy }) => (
                <>
                  <QuickChip label="Walk me through it" onClick={() => { if (!busy) deliver('Walk me through this step in more detail.'); }} />
                  <QuickChip label="Is this okay?" onClick={() => prefill('Is this okay? ')} />
                  <QuickChip label="Show me a reference" onClick={() => prefill('Show me a reference photo of ')} />
                </>
              )}
            />
          </div>
        )}
      </div>
      {/* Ask Buddy lives here permanently (founder: always visible, easy to
          find); back-to-list is the top-left chevron, so no third button. */}
      <div style={{ padding: '12px 16px 22px', borderTop: BORDER, background: '#fff', display: 'flex', gap: 10 }}>
        <button
          onClick={() => {
            const opening = !chatOpen;
            setChatOpen(opening);
            if (opening) {
              logEvent('ask_about_step', { step: i + 1, title: d.t });
              // The chat panel sits at the bottom of the scroll area; bring it into view.
              setTimeout(() => contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' }), 60);
            }
          }}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--coral)', border: BORDER, borderRadius: 14, padding: 13, fontFamily: FFD, fontWeight: 800, fontSize: 15, color: '#fff', boxShadow: HARD2, cursor: 'pointer' }}
        >
          💬 {chatOpen ? 'Hide chat' : 'Ask Buddy'}
        </button>
        <button onClick={gotItNext} style={{ flex: 1, background: 'var(--green)', border: BORDER, borderRadius: 14, padding: 13, fontFamily: FFD, fontWeight: 800, fontSize: 15, color: '#fff', boxShadow: HARD2, cursor: 'pointer' }}>Got it, next ✓</button>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 5 — Quick mode (real Buddy chat, streamed from /api/chat)
// ============================================================
type QuickProps = {
  goHome: () => void;
  triggerSafety: () => void;
  breed: string;
  // Saved-chat plumbing: restore a record's messages, report new ones upward.
  initialMessages?: UIMessage[];
  onMessages?: (messages: UIMessage[]) => void;
};

// The reusable live-chat panel (thread + chips + input + photo picker). The
// Quick screen wraps it full-height; Detail embeds it compact, in place, so a
// step question is answered right where the student is standing.
type ChatPanelProps = {
  // Lightweight session context the model gets (curriculum RAG is added server-side).
  context: string;
  intro: React.ReactNode;
  // Embedded inside another screen (step detail): bounded thread, tighter chrome.
  compact?: boolean;
  chips?: (h: { deliver: (text: string) => void; prefill: (text: string) => void; busy: boolean }) => React.ReactNode;
  // Externally injected question (the steps-screen bottom bar feeds the groom
  // chat sheet this way). Bump `n` for each ask; consumed exactly once.
  ask?: { text: string; n: number } | null;
  onAskConsumed?: () => void;
  // Saved-chat plumbing (Quick tab only): seed the thread from a record and
  // report the messages after each finished exchange so the parent can persist.
  initialMessages?: UIMessage[];
  onMessages?: (messages: UIMessage[]) => void;
};

function QuickChip({ label, onClick, tone }: { label: string; onClick: () => void; tone?: 'red' }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 'none', background: tone === 'red' ? 'var(--red-tint)' : '#fff', border: BORDER,
        borderRadius: 999, padding: '8px 13px', fontFamily: FFD, fontWeight: 800, fontSize: 13,
        color: tone === 'red' ? 'var(--red-text)' : INK, boxShadow: HARD2, cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function ChatBubble({ role, children }: { role: string; children: React.ReactNode }) {
  if (role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', animation: 'gbPop .3s ease' }}>
        <div style={{ maxWidth: '82%', background: 'var(--primary)', border: BORDER, borderRadius: 16, borderBottomRightRadius: 4, padding: '10px 12px', fontSize: 14, fontWeight: 700, color: INK, boxShadow: HARD2, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'gbPop .3s ease' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MASCOT} alt="Buddy" style={{ flex: 'none', width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: BORDER, background: '#fff' }} />
      <div style={{ maxWidth: '82%', background: '#fff', border: BORDER, borderRadius: 16, borderTopLeftRadius: 4, padding: '11px 13px', fontSize: 14, fontWeight: 600, color: INK, lineHeight: 1.45, boxShadow: HARD2, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

// Claude-web-style clarifying questions: up to 3 cards, each a few tap options
// plus an "Other" free-text, with a Skip for the student who wants to go quick.
type AskQ = { id: string; question: string; options: string[] };
function QuestionCards({
  questions,
  onSubmit,
  onSkip,
}: {
  questions: AskQ[];
  onSubmit: (answers: { id: string; question: string; answer: string }[]) => void;
  onSkip: () => void;
}) {
  const [sel, setSel] = useState<Record<string, string>>({});
  const [otherOn, setOtherOn] = useState<Record<string, boolean>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const answerOf = (q: AskQ) => (otherOn[q.id] ? (otherText[q.id] || '').trim() : sel[q.id] || '');
  const allAnswered = questions.every((q) => answerOf(q).length > 0);

  const chip = (q: AskQ, label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      disabled={sent}
      onClick={onClick}
      style={{ background: active ? 'var(--primary)' : '#fff', border: BORDER, borderRadius: 999, padding: '7px 12px', fontFamily: FFD, fontWeight: 800, fontSize: 12.5, color: INK, cursor: sent ? 'default' : 'pointer' }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--primary-soft)', border: BORDER, borderRadius: 14, padding: 13, boxShadow: HARD2 }}>
      <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 13, color: 'var(--gold-deep)' }}>Quick bit of context so I&apos;m actually useful 👇</div>
      {questions.map((q) => (
        <div key={q.id}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: INK, marginBottom: 6 }}>{q.question}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {q.options.map((opt) =>
              chip(q, opt, !otherOn[q.id] && sel[q.id] === opt, () => {
                setSel((s) => ({ ...s, [q.id]: opt }));
                setOtherOn((o) => ({ ...o, [q.id]: false }));
              }),
            )}
            {chip(q, 'Other', !!otherOn[q.id], () => setOtherOn((o) => ({ ...o, [q.id]: !o[q.id] })))}
          </div>
          {otherOn[q.id] && (
            <input
              autoFocus
              disabled={sent}
              value={otherText[q.id] || ''}
              onChange={(e) => setOtherText((t) => ({ ...t, [q.id]: e.target.value }))}
              placeholder="Type your answer…"
              style={{ marginTop: 6, width: '100%', background: '#fff', border: BORDER, borderRadius: 12, padding: 10, fontWeight: 700, fontSize: 13, color: INK, fontFamily: FFB, outline: 'none' }}
            />
          )}
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => { if (allAnswered && !sent) { setSent(true); onSubmit(questions.map((q) => ({ id: q.id, question: q.question, answer: answerOf(q) }))); } }}
          disabled={!allAnswered || sent}
          style={{ flex: 1, background: 'var(--green)', border: BORDER, borderRadius: 12, padding: 11, fontFamily: FFD, fontWeight: 800, fontSize: 14, color: '#fff', boxShadow: HARD2, cursor: allAnswered && !sent ? 'pointer' : 'default', opacity: allAnswered && !sent ? 1 : 0.5 }}
        >
          {sent ? 'Thanks!' : 'Send answers'}
        </button>
        <button
          onClick={() => { if (!sent) { setSent(true); onSkip(); } }}
          disabled={sent}
          style={{ flex: 'none', background: 'transparent', border: 'none', fontFamily: FFB, fontWeight: 800, fontSize: 13, color: 'var(--muted-2)', cursor: sent ? 'default' : 'pointer' }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

function ChatPanel({ context, intro, compact, chips, ask, onAskConsumed, initialMessages, onMessages }: ChatPanelProps) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: { context },
        // Pilot access code (if the deploy set one). Read fresh per request so a
        // student who unlocks mid-session doesn't need a reload.
        headers: () => ({
          'x-access-code': localStorage.getItem('gb_access') ?? '',
          'x-device-id': getDeviceId(),
        }),
      }),
    [context],
  );
  // sendAutomaticallyWhen: once the student answers the askQuestions card, the
  // tool result is filled and the model auto-continues to the feedback.
  const { messages, sendMessage, status, addToolResult, error } = useChat({
    transport,
    messages: initialMessages,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
  // Persist upward once each exchange settles. Guarded by "grew since mount" so
  // merely opening a saved chat doesn't re-stamp its savedAt.
  const initialLen = useRef(initialMessages?.length ?? 0);
  useEffect(() => {
    if (status === 'ready' && messages.length > initialLen.current) onMessages?.(messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, messages.length]);
  // Friendly text for a failed send. The server puts human-readable copy in
  // {error} for 429/4xx (rate limit, access code), so surface that when present.
  const errText = useMemo(() => {
    if (!error) return null;
    try {
      const j = JSON.parse(error.message) as { error?: string };
      if (j?.error) return j.error;
    } catch { /* not JSON — fall through */ }
    return "That didn't go through. Check your connection and try again.";
  }, [error]);

  const [input, setInput] = useState('');
  const [pending, setPending] = useState<{ url: string; mediaType: string; name: string; dark: boolean; blurry: boolean } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const busy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  // Grow the chat box with the text (up to ~4 lines), and shrink back when it's
  // cleared (send/prefill set `input` directly, so keying on it covers both).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 116)}px`;
    // No scrollbar until the text actually exceeds the cap.
    el.style.overflowY = el.scrollHeight > 116 ? 'auto' : 'hidden';
  }, [input]);

  function deliver(text: string) {
    const files = pending
      ? [{ type: 'file' as const, mediaType: pending.mediaType, url: pending.url, filename: pending.name }]
      : undefined;
    if (!text && !files) return;
    sendMessage({ text, files });
    logEvent('quick_question', { text, hasPhoto: !!files });
    setInput('');
    setPending(null);
  }
  const send = () => { if (!busy) deliver(input.trim()); };
  const prefill = (s: string) => { setInput(s); setTimeout(() => inputRef.current?.focus(), 0); };

  // ---- voice input: hold court with Buddy hands-free ----
  // Mic button (shows when the box is empty) records via MediaRecorder under a
  // full-screen "Buddy is listening" overlay, sends the clip to /api/transcribe
  // (Whisper), and drops the transcript into the input to review + send. The
  // transcript is NOT auto-sent: mis-hearings mid-groom are worse than one tap.
  const [rec, setRec] = useState<'idle' | 'listening' | 'thinking'>('idle');
  const [recSecs, setRecSecs] = useState(0);
  const [recErr, setRecErr] = useState('');
  const recRef = useRef<MediaRecorder | null>(null);
  const recChunks = useRef<Blob[]>([]);
  const recCancel = useRef(false);
  const recTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const recErrTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flashRecErr(msg: string) {
    setRecErr(msg);
    if (recErrTimer.current) clearTimeout(recErrTimer.current);
    recErrTimer.current = setTimeout(() => setRecErr(''), 6000);
  }
  function recCleanup() {
    if (recTimer.current) { clearInterval(recTimer.current); recTimer.current = null; }
    recRef.current?.stream.getTracks().forEach((t) => t.stop());
    recRef.current = null;
  }

  async function transcribe(blob: Blob) {
    try {
      const fd = new FormData();
      fd.append('audio', blob, blob.type.includes('mp4') ? 'voice.mp4' : 'voice.webm');
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'x-access-code': localStorage.getItem('gb_access') ?? '', 'x-device-id': getDeviceId() },
        body: fd,
      });
      const j = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
      if (!res.ok) { flashRecErr(j.error ?? "That didn't go through. Try again?"); return; }
      if (!j.text) { flashRecErr("Buddy didn't catch that. A bit closer to the mic?"); return; }
      const heard = j.text;
      setInput((prev) => (prev.trim() ? `${prev.trim()} ${heard}` : heard));
      logEvent('voice_input', { chars: heard.length });
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch {
      flashRecErr("That didn't go through. Check your connection and try again.");
    } finally {
      setRec('idle');
    }
  }

  async function startVoice() {
    setRecErr('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      flashRecErr("This browser can't record voice. Typing still works great.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // iOS Safari records audio/mp4; Chrome/Android prefer webm+opus.
      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((m) => MediaRecorder.isTypeSupported(m));
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recChunks.current = [];
      recCancel.current = false;
      recorder.ondataavailable = (e) => { if (e.data.size) recChunks.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(recChunks.current, { type: recorder.mimeType || 'audio/mp4' });
        recCleanup();
        if (recCancel.current) { setRec('idle'); return; }
        void transcribe(blob);
      };
      recRef.current = recorder;
      recorder.start(1000);
      setRecSecs(0);
      recTimer.current = setInterval(() => setRecSecs((s) => s + 1), 1000);
      setRec('listening');
    } catch {
      flashRecErr('Buddy needs mic permission for voice. You can still type.');
    }
  }

  function stopVoice(sendIt: boolean) {
    const r = recRef.current;
    if (!r) return;
    recCancel.current = !sendIt;
    setRec(sendIt ? 'thinking' : 'idle');
    try { r.stop(); } catch { recCleanup(); setRec('idle'); }
  }

  // Hard cap so a pocket-recording can't run forever (server caps size too).
  useEffect(() => {
    if (rec === 'listening' && recSecs >= 90) stopVoice(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recSecs, rec]);
  // Unmount mid-recording: kill the mic, drop the clip.
  useEffect(() => () => {
    recCancel.current = true;
    try { recRef.current?.stop(); } catch { /* already stopped */ }
    recCleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A question handed in from outside (steps bar → groom chat sheet).
  useEffect(() => {
    if (!ask?.text) return;
    deliver(ask.text);
    onAskConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ask?.n]);

  const hasInput = input.trim().length > 0 || !!pending;

  return (
    <>
      {/* thread */}
      <div
        ref={scrollRef}
        className={compact ? undefined : 'gbsc scroll'}
        style={compact
          ? { maxHeight: 300, overflowY: 'auto', padding: '4px 2px 8px', display: 'flex', flexDirection: 'column', gap: 10 }
          : { padding: '14px 18px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <ChatBubble role="assistant">{intro}</ChatBubble>

        {messages.map((m) => (
          <ChatBubble key={m.id} role={m.role}>
            {m.parts.map((part, i) => {
              if (part.type === 'text') {
                return part.text ? (
                  <div key={i}>
                    <Markdown components={MD} disallowedElements={['img']} unwrapDisallowed>
                      {part.text}
                    </Markdown>
                  </div>
                ) : null;
              }
              if (part.type === 'file' && part.mediaType?.startsWith('image/')) {
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={part.url} alt="your photo" style={{ width: '100%', maxWidth: 220, borderRadius: 12, border: BORDER2, display: 'block' }} />
                );
              }
              if (part.type === 'tool-findReferenceImages' && part.state === 'output-available') {
                const imgs = (part.output as Array<{ url: string; caption?: string }>) ?? [];
                if (!Array.isArray(imgs) || imgs.length === 0) return null;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {imgs.map((im, k) => (
                      <figure key={k} style={{ margin: 0 }}>
                        <div style={{ border: BORDER, borderRadius: 12, overflow: 'hidden' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={im.url} alt={im.caption ?? 'reference'} style={{ width: '100%', display: 'block' }} />
                        </div>
                        {im.caption && <figcaption style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-1)', marginTop: 5 }}>{im.caption}</figcaption>}
                      </figure>
                    ))}
                  </div>
                );
              }
              if (part.type === 'tool-askQuestions') {
                if (part.state === 'input-available') {
                  const qs = (part.input as { questions?: AskQ[] })?.questions ?? [];
                  if (!qs.length) return null;
                  return (
                    <QuestionCards
                      key={i}
                      questions={qs}
                      onSubmit={(answers) => addToolResult({ tool: 'askQuestions', toolCallId: part.toolCallId, output: { answers } })}
                      onSkip={() => addToolResult({ tool: 'askQuestions', toolCallId: part.toolCallId, output: { skipped: true } })}
                    />
                  );
                }
                if (part.state === 'output-available') {
                  const out = part.output as { answers?: { answer: string }[]; skipped?: boolean } | undefined;
                  if (out?.skipped) {
                    return <div key={i} style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-2)' }}>Skipped. Giving you my best read.</div>;
                  }
                  if (out?.answers?.length) {
                    return (
                      <div key={i} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted-1)', lineHeight: 1.45 }}>
                        {out.answers.map((a, k) => <div key={k}>· {a.answer}</div>)}
                      </div>
                    );
                  }
                  return null;
                }
                return null;
              }
              return null;
            })}
          </ChatBubble>
        ))}

        {busy && messages[messages.length - 1]?.role !== 'assistant' && (
          <ChatBubble role="assistant"><span style={{ fontWeight: 600, color: 'var(--muted-2)' }}>Buddy&apos;s thinking…</span></ChatBubble>
        )}
        {status === 'error' && errText && (
          <ChatBubble role="assistant"><span style={{ fontWeight: 700, color: 'var(--red-text)' }}>{errText}</span></ChatBubble>
        )}
        <div style={{ height: 4 }} />
      </div>

      {/* suggestion chips — one-tap starts, no second box */}
      {chips && (
        <div className="gbsc" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: compact ? '2px 0 0' : '4px 18px 0' }}>
          {chips({ deliver, prefill, busy })}
        </div>
      )}

      {/* attached-photo preview */}
      {pending && (
        <div style={{ padding: compact ? '8px 0 0' : '8px 18px 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: BORDER, borderRadius: 12, padding: 6, boxShadow: HARD2 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pending.url} alt="attached" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, border: BORDER2 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>Photo ready</span>
            <button onClick={() => setPending(null)} aria-label="Remove photo" style={{ border: 'none', background: 'transparent', fontWeight: 900, fontSize: 16, color: 'var(--muted-2)', cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
          {/* gentle, non-blocking nudge — you can always send anyway */}
          {(pending.dark || pending.blurry) && (
            <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: 'var(--red-text)' }}>
              {pending.dark && pending.blurry
                ? 'A bit dark and soft. More light and a steady hand help me see, but you can still send.'
                : pending.dark
                  ? 'A bit dark. More light helps me see, but you can still send.'
                  : 'A little blurry. Hold steady for a sharper one, but you can still send.'}
            </div>
          )}
          <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: 'var(--muted-2)' }}>
            📸 Good light, fill the frame, hold steady. A front and a side shot help most.
          </div>
        </div>
      )}

      {/* transient voice error (mic denied, transcription hiccup) */}
      {recErr && (
        <div style={{ padding: compact ? '6px 0 0' : '6px 18px 0', fontSize: 12, fontWeight: 700, color: 'var(--red-text)' }}>{recErr}</div>
      )}

      {/* chat bar: [+] · input · mic/send */}
      <div style={compact
        ? { padding: '8px 0 2px', display: 'flex', alignItems: 'flex-end', gap: 8 }
        : { padding: '10px 18px 22px', borderTop: BORDER, background: '#fff', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <button onClick={() => fileRef.current?.click()} aria-label="Add photo" style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', background: 'var(--neutral-fill)', border: BORDER, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: HARD2 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={INK} strokeWidth="3" strokeLinecap="round" /></svg>
        </button>
        <textarea
          ref={inputRef}
          className="gbin"
          value={input}
          rows={1}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Buddy anything…"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          style={{ flex: 1, background: 'var(--neutral-fill)', border: BORDER, borderRadius: 14, padding: 13, fontWeight: 700, fontSize: 14, color: INK, fontFamily: FFB, outline: 'none', resize: 'none', overflowY: 'hidden', lineHeight: 1.4, maxHeight: 116 }}
        />
        {hasInput ? (
          <button
            onClick={send}
            disabled={busy}
            aria-label="Send"
            style={{ flex: 'none', width: 50, height: 50, borderRadius: '50%', background: 'var(--coral)', border: BORDER3, boxShadow: HARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: !busy ? 'pointer' : 'default', opacity: !busy ? 1 : 0.4 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12h13M12 5l7 7-7 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        ) : (
          // Empty box → the button is a mic (talk instead of type, wet hands).
          <button
            onClick={startVoice}
            aria-label="Talk to Buddy"
            style={{ flex: 'none', width: 50, height: 50, borderRadius: '50%', background: 'var(--coral)', border: BORDER3, boxShadow: HARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="3" width="6" height="11" rx="3" stroke="#fff" strokeWidth="2.5" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* full-screen listening overlay: calm, doggy, Pi-style hills */}
      {rec !== 'idle' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 95, background: 'var(--cream)', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'gbPop .2s ease' }}>
          {/* rolling green hills along the bottom */}
          <div style={{ position: 'absolute', bottom: -150, left: '-25%', width: '150%', height: 280, background: 'var(--green-tint)', borderRadius: '50% 50% 0 0' }} />
          <div style={{ position: 'absolute', bottom: -205, left: '-15%', width: '130%', height: 280, background: 'var(--green)', borderRadius: '50% 50% 0 0' }} />

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 30px', textAlign: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MASCOT} alt="" style={{ width: 108, height: 108, objectFit: 'cover', borderRadius: '50%', border: BORDER3, boxShadow: HARD, animation: 'gbFloat 2.6s ease-in-out infinite' }} />
            <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 21, color: INK, marginTop: 20 }}>
              {rec === 'listening' ? 'Buddy is listening…' : 'Getting that down…'}
            </div>
            {rec === 'listening' ? (
              <>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{ fontSize: 15, animation: `gbType 1.2s ${i * 0.18}s ease-in-out infinite`, display: 'inline-block' }}>🐾</span>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontFamily: FFB, fontWeight: 700, fontSize: 13, color: 'var(--muted-2)' }}>
                  {Math.floor(recSecs / 60)}:{String(recSecs % 60).padStart(2, '0')}
                </div>
                <div style={{ marginTop: 4, fontFamily: FFB, fontWeight: 700, fontSize: 13, color: 'var(--muted-1)' }}>
                  Talk to me like I&apos;m right there at the table.
                </div>
                <button
                  onClick={() => stopVoice(true)}
                  style={{ width: 'min(300px, 76vw)', marginTop: 26, background: 'var(--primary)', border: BORDER, borderRadius: 16, padding: 14, fontFamily: FFD, fontWeight: 800, fontSize: 15, color: INK, boxShadow: HARD, cursor: 'pointer' }}
                >
                  Done talking
                </button>
                <button
                  onClick={() => stopVoice(false)}
                  style={{ marginTop: 10, background: 'transparent', border: 'none', fontFamily: FFB, fontWeight: 700, fontSize: 13, color: 'var(--muted-2)', cursor: 'pointer' }}
                >
                  Never mind
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: INK, animation: `gbType 1.2s ${i * 0.18}s ease-in-out infinite`, display: 'inline-block' }} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* hidden picker behind the ➕ (camera on mobile, library on desktop) */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.heic,.heif"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const { url, mediaType } = await fileToImageDataUrl(file); // handles HEIC
            const q = await analyzeImage(url); // quick on-device light/blur check
            setPending({ url, mediaType, name: file.name, dark: q.dark, blurry: q.blurry });
          }
          if (fileRef.current) fileRef.current.value = ''; // allow re-picking the same file
        }}
      />
    </>
  );
}

function Quick({ goHome, triggerSafety, breed, initialMessages, onMessages }: QuickProps) {
  // Latched at mount: saving the first exchange updates the record and flips
  // initialMessages mid-conversation, and the intro must not swap under them.
  const [resuming] = useState((initialMessages?.length ?? 0) > 0);
  return (
    <div className="scr">
      {/* header: plain back button (the old toggle looked tappable both ways
          but "Guided groom" just went Home — confusing) */}
      <div style={{ padding: '38px 18px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <ChevronL onClick={goHome} />
        <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 21, color: INK, lineHeight: 1 }}>Quick question</div>
      </div>
      <ChatPanel
        initialMessages={initialMessages}
        onMessages={onMessages}
        context={`Dog: a ${breed}.`}
        intro={resuming
          ? <span>Picking up right where we left off. What else can I help with?</span>
          : <span>I&apos;m right here. Ask me anything, tap a button below, or snap a pic with the ➕. What&apos;s up?</span>}
        chips={({ deliver, prefill, busy }) => (
          <>
            <QuickChip label="What's next?" onClick={() => { if (!busy) { deliver('What should I do next?'); } }} />
            <QuickChip label="How do I…" onClick={() => prefill('How do I ')} />
            <QuickChip label="Is this okay?" onClick={() => prefill('Is this okay? ')} />
            <QuickChip label="Show me a reference" onClick={() => prefill('Show me a reference photo of ')} />
            <QuickChip label="🚨 Something's wrong" tone="red" onClick={triggerSafety} />
          </>
        )}
      />
    </div>
  );
}

// ============================================================
// SCREEN 6 — Den (progress)
// ============================================================
// The Den is a labeled PREVIEW of progress (no accounts/persistence yet), so it
// shows a few simple, fun, easy-to-follow facts only. Removed for now (kept in
// memory `grooming-buddy-build` to revive if persistence lands): "Good Calls"
// badge, skill levels/bars, and the Breeds Passport progression counter — those
// imply tracking we cannot back yet and risk eroding trust.
function Den({ backFromDen, photos, openSurvey }: { backFromDen: () => void; photos: string[]; openSurvey: () => void }) {
  const stat = (val: React.ReactNode, color: string, label: string) => (
    <div style={{ flex: 1, background: '#fff', border: BORDER, borderRadius: 16, padding: 12, boxShadow: HARD, textAlign: 'center' }}>
      <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 24, color, lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-1)' }}>{label}</div>
    </div>
  );
  const breedChip = (label: string) => (
    <div style={{ background: 'var(--primary)', border: BORDER2, borderRadius: 999, padding: '7px 13px', fontFamily: FFD, fontWeight: 800, fontSize: 13, color: INK }}>{label}</div>
  );
  return (
    <div className="scr">
      <div style={{ background: 'var(--primary)', borderBottom: BORDER, padding: '38px 18px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <ChevronL size={22} onClick={backFromDen} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MASCOT} alt="Buddy" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: BORDER3, background: '#fff' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: FFD, fontWeight: 800, fontSize: 20, color: INK, lineHeight: 1 }}>Buddy&apos;s Den</span>
            <span style={{ background: '#fff', border: BORDER2, borderRadius: 999, padding: '2px 9px', fontFamily: FFD, fontWeight: 800, fontSize: 11, color: INK }}>Preview</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-deep)', marginTop: 2 }}>A peek at what your progress could look like 🐾</div>
        </div>
      </div>
      <div className="gbsc scroll" style={{ padding: '16px 16px 22px', display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {stat('7🔥', 'var(--coral)', 'day streak')}
          {stat('12', 'var(--green)', 'grooms with Buddy')}
          {stat('📸 28', INK, 'photo checks')}
        </div>
        <div style={{ background: '#fff', border: BORDER, borderRadius: 16, padding: 14, boxShadow: HARD }}>
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 16, color: INK, marginBottom: 11 }}>Breeds you&apos;ve groomed</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {breedChip('Goldendoodle')}
            {breedChip('Shih Tzu')}
            {breedChip('Poodle')}
            {breedChip('Cocker Spaniel')}
          </div>
        </div>
        {/* Portfolio preview: grooms checked this session (no storage yet) */}
        <div style={{ background: '#fff', border: BORDER, borderRadius: 16, padding: 14, boxShadow: HARD }}>
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 16, color: INK, marginBottom: 11 }}>Your grooms</div>
          {photos.length === 0 ? (
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-1)', lineHeight: 1.4 }}>The grooms you snap photos of will show up here, building your portfolio. 🐾</div>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {photos.map((src, k) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={k} src={src} alt="your groom" style={{ width: 78, height: 78, objectFit: 'cover', borderRadius: 12, border: BORDER2 }} />
              ))}
            </div>
          )}
        </div>
        <div style={{ background: 'var(--primary-soft)', border: BORDER, borderRadius: 16, padding: 13, display: 'flex', gap: 10, alignItems: 'center', boxShadow: HARD }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MASCOT} alt="Buddy" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: BORDER, background: '#fff' }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-deep)', lineHeight: 1.35 }}>&quot;Every groom we do together, you get a little sharper. Keep it up! 🐾&quot; · Buddy</div>
        </div>
        <button onClick={openSurvey} style={{ background: '#fff', border: BORDER, borderRadius: 16, padding: 14, fontFamily: FFD, fontWeight: 800, fontSize: 15, color: INK, boxShadow: HARD, cursor: 'pointer' }}>Tell us what you think 💬</button>
      </div>
    </div>
  );
}

// ============================================================
// OVERLAY — Safety stop
// ============================================================
function Safety({ stoppedGetHelp, closeSafety }: { stoppedGetHelp: () => void; closeSafety: () => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'rgba(43,33,26,.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ background: 'var(--red-tint)', borderTop: BORDER3, borderRadius: '32px 32px 40px 40px', padding: '24px 22px 28px', position: 'relative', animation: 'gbSlideUp .32s ease' }}>
        <div style={{ position: 'absolute', top: -34, left: '50%', transform: 'translateX(-50%)', width: 64, height: 64, borderRadius: '50%', background: 'var(--red)', border: '4px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: HARD }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M12 8v5" stroke="#fff" strokeWidth="3" strokeLinecap="round" /><circle cx="12" cy="17" r="1.6" fill="#fff" /></svg>
        </div>
        <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 24, color: INK, textAlign: 'center', marginTop: 14, lineHeight: 1.1 }}>Let&apos;s pause, and get a person.</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#7A2E31', textAlign: 'center', lineHeight: 1.45, marginTop: 10 }}>A yelp + pulling away can mean a nail&apos;s cut too short or she&apos;s hurting. <b>This is one to hand off</b>. Please stop and grab your instructor or a senior groomer now.</div>
        <div style={{ background: '#fff', border: BORDER, borderRadius: 16, padding: 13, marginTop: 16 }}>
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 13, color: 'var(--red-text)', marginBottom: 6 }}>While you wait</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#4A3C30', lineHeight: 1.4 }}>Keep her calm and still, gently check the paw for bleeding, don&apos;t keep cutting.</div>
        </div>
        <button onClick={stoppedGetHelp} style={{ width: '100%', marginTop: 16, background: 'var(--red)', border: BORDER3, borderRadius: 16, padding: 15, fontFamily: FFD, fontWeight: 800, fontSize: 17, color: '#fff', boxShadow: HARD, cursor: 'pointer' }}>I&apos;ve stopped, get help</button>
        <button onClick={closeSafety} style={{ width: '100%', marginTop: 10, background: 'transparent', border: 'none', fontFamily: FFB, fontWeight: 700, fontSize: 13, color: 'var(--muted-2)', cursor: 'pointer' }}>It was a false alarm</button>
      </div>
    </div>
  );
}

// ============================================================
// OVERLAY — End-of-demo survey (anonymous, no account)
// ============================================================
function Survey({ sessionId, close }: { sessionId: string; close: () => void }) {
  const [wouldUse, setWouldUse] = useState('');
  const [wouldPay, setWouldPay] = useState('');
  const [missing, setMissing] = useState('');
  const [sent, setSent] = useState(false);

  async function submit() {
    setSent(true);
    try {
      await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, wouldUse, wouldPay, whatsMissing: missing }),
      });
    } catch {
      /* keep the thank-you regardless */
    }
  }

  const label = (t: string) => (
    <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 14, color: INK, margin: '16px 0 8px' }}>{t}</div>
  );
  const choice = (val: string, cur: string, set: (v: string) => void, text: string) => (
    <button onClick={() => set(val)} style={{ flex: 1, padding: 11, borderRadius: 12, border: BORDER, fontFamily: FFD, fontWeight: 800, fontSize: 14, cursor: 'pointer', background: cur === val ? 'var(--primary)' : '#fff', color: INK, boxShadow: cur === val ? HARD2 : 'none' }}>{text}</button>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 75, background: 'rgba(43,33,26,.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ background: 'var(--cream)', borderTop: BORDER3, borderRadius: '32px 32px 0 0', padding: '24px 22px 28px', animation: 'gbSlideUp .32s ease', maxHeight: '88%', overflowY: 'auto' }} className="gbsc">
        {sent ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 23, color: INK }}>Thank you! 🐾</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted-1)', marginTop: 8, lineHeight: 1.45 }}>That genuinely helps Buddy get better. Appreciate you.</div>
            <button onClick={close} style={{ width: '100%', marginTop: 18, background: 'var(--green)', border: BORDER, borderRadius: 16, padding: 15, fontFamily: FFD, fontWeight: 800, fontSize: 16, color: '#fff', boxShadow: HARD, cursor: 'pointer' }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 23, color: INK, textAlign: 'center' }}>How&apos;d that feel?</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-1)', textAlign: 'center', marginTop: 4 }}>Three quick things, totally anonymous.</div>

            {label('Would you actually use this?')}
            <div style={{ display: 'flex', gap: 8 }}>
              {choice('yes', wouldUse, setWouldUse, 'Yes')}
              {choice('maybe', wouldUse, setWouldUse, 'Maybe')}
              {choice('no', wouldUse, setWouldUse, 'Nah')}
            </div>

            {label('Would you pay for it?')}
            <div style={{ display: 'flex', gap: 8 }}>
              {choice('yes', wouldPay, setWouldPay, 'Yes')}
              {choice('maybe', wouldPay, setWouldPay, 'Maybe')}
              {choice('no', wouldPay, setWouldPay, 'No')}
            </div>

            {label("What's missing, or what would make it a no-brainer?")}
            <textarea value={missing} onChange={(e) => setMissing(e.target.value)} rows={3} placeholder="Tell Buddy anything…" style={{ width: '100%', resize: 'none', background: '#fff', border: BORDER, borderRadius: 14, padding: 12, font: 'inherit', fontFamily: FFB, fontSize: 15, color: INK, outline: 'none' }} />

            <button onClick={submit} style={{ width: '100%', marginTop: 16, background: 'var(--primary)', border: BORDER, borderRadius: 16, padding: 15, fontFamily: FFD, fontWeight: 800, fontSize: 16, color: INK, boxShadow: HARD, cursor: 'pointer' }}>Send it →</button>
            <button onClick={close} style={{ width: '100%', marginTop: 10, background: 'transparent', border: 'none', fontFamily: FFB, fontWeight: 700, fontSize: 13, color: 'var(--muted-2)', cursor: 'pointer' }}>Skip</button>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// OVERLAY — Quick feedback (the persistent 💬 nib + one soft prompt)
// ============================================================
// One rating + one open box, 15 seconds tops. Saved through the anonymous
// events pipeline (type "feedback"), so no new table or endpoint is needed:
// select payload from events where type = 'feedback'.
function Feedback({ close }: { close: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!rating) return;
    setSent(true);
    // Rest the periodic nudge for a week; they just gave us what it asks for.
    try { localStorage.setItem('gb_fb_sent_at', String(Date.now())); } catch { /* fine */ }
    try {
      await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSessionId(),
          type: 'feedback',
          payload: { rating, comment: comment.trim().slice(0, 1200), deviceId: getDeviceId() },
        }),
      });
    } catch {
      /* keep the thank-you regardless */
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 75, background: 'rgba(43,33,26,.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={close}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--cream)', borderTop: BORDER3, borderRadius: '32px 32px 0 0', padding: '22px 22px 26px', animation: 'gbSlideUp .32s ease' }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 21, color: INK }}>Thank you! 🐾</div>
            <button onClick={close} style={{ width: '100%', marginTop: 16, background: 'var(--green)', border: BORDER, borderRadius: 16, padding: 14, fontFamily: FFD, fontWeight: 800, fontSize: 15, color: '#fff', boxShadow: HARD, cursor: 'pointer' }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 20, color: INK, textAlign: 'center' }}>How&apos;s Buddy doing?</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  aria-label={`${n} out of 5`}
                  style={{ width: 46, height: 46, borderRadius: 14, border: rating === n ? BORDER3 : BORDER, background: n <= rating ? 'var(--primary)' : '#fff', boxShadow: n <= rating ? HARD2 : 'none', cursor: 'pointer', fontSize: 20, padding: 0 }}
                >
                  🐾
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Ideas, gripes, wishes… anything helps."
              style={{ width: '100%', marginTop: 14, resize: 'none', background: '#fff', border: BORDER, borderRadius: 14, padding: 12, font: 'inherit', fontFamily: FFB, fontSize: 15, color: INK, outline: 'none' }}
            />
            <button
              onClick={submit}
              disabled={!rating}
              style={{ width: '100%', marginTop: 14, background: 'var(--primary)', border: BORDER, borderRadius: 16, padding: 14, fontFamily: FFD, fontWeight: 800, fontSize: 15, color: INK, boxShadow: HARD, cursor: rating ? 'pointer' : 'default', opacity: rating ? 1 : 0.5 }}
            >
              Send it →
            </button>
            <button onClick={close} style={{ width: '100%', marginTop: 8, background: 'transparent', border: 'none', fontFamily: FFB, fontWeight: 700, fontSize: 13, color: 'var(--muted-2)', cursor: 'pointer' }}>Not now</button>
          </>
        )}
      </div>
    </div>
  );
}
