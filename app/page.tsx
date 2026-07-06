'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import Markdown from 'react-markdown';
import { GROOM_STEPS } from '@/data/groom-steps';
import { logEvent, getSessionId } from '@/lib/analytics';

// ============================================================
// Grooming Buddy — single-screen state machine (per the handoff).
// Screens: intro · home · steps · detail · quick · progress(Den)
// Overlays: safety · listening
// Pixel-ported from the Claude Design prototype; tokens via CSS vars.
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

type Screen = 'intro' | 'home' | 'steps' | 'detail' | 'quick' | 'progress';

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
function MicIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="#fff" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v3" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
// ---------- mic button ----------
function Mic({ big, onClick }: { big?: boolean; onClick: () => void }) {
  const d = big ? 54 : 50;
  return (
    <div
      onClick={onClick}
      style={{
        flex: 'none', width: d, height: d, borderRadius: '50%', background: 'var(--coral)',
        border: BORDER3, boxShadow: big ? HARD : HARD2, display: 'flex',
        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}
    >
      <MicIcon size={big ? 24 : 22} />
    </div>
  );
}

export default function BuddyApp() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [stepIdx, setStepIdx] = useState(0); // fresh groom: start at step 1
  const [done, setDone] = useState<boolean[]>(Array(GROOM_STEPS.length).fill(false));
  const [selStep, setSelStep] = useState(0);
  const [breed, setBreed] = useState('Goldendoodle'); // set by the breed chips on Home
  const [showSafety, setShowSafety] = useState(false);
  const [showListening, setShowListening] = useState(false);
  const [prevScreen, setPrevScreen] = useState<Screen>('home');

  // session "portfolio" preview (no writer yet; Den shows the empty state) + survey overlay
  const [photos] = useState<string[]>([]);
  const [showSurvey, setShowSurvey] = useState(false);

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

  // Deep-link to a screen via ?s=home|steps|detail|quick|progress
  // (handy for demos and screenshots). Runs after mount to avoid hydration drift.
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('s') as Screen | null;
    const valid: Screen[] = ['intro', 'home', 'steps', 'detail', 'quick', 'progress'];
    if (s && valid.includes(s)) setScreen(s);
  }, []);

  const doneCount = done.filter(Boolean).length;

  // ---- navigation / handlers (mirror the prototype) ----
  const letsGroom = () => setScreen('home');
  const goHome = () => setScreen('home');
  const backToList = () => setScreen('steps');
  const openDetail = (i: number) => { setSelStep(i); setScreen('detail'); logEvent('step_open', { step: i + 1, title: GROOM_STEPS[i].t }); };
  const setQuickMode = () => setScreen('quick');
  const gotItNext = () => {
    const d = done.slice();
    d[stepIdx] = true;
    setDone(d);
    const wasLast = stepIdx === GROOM_STEPS.length - 1;
    setStepIdx(Math.min(stepIdx + 1, GROOM_STEPS.length - 1));
    setScreen('steps');
    if (wasLast || d.every(Boolean)) { logEvent('groom_complete', {}); setShowSurvey(true); }
  };
  const goDen = () => { setPrevScreen(screen); setScreen('progress'); };
  const backFromDen = () => setScreen(prevScreen || 'home');
  const openListening = () => setShowListening(true);
  const triggerSafety = () => { setShowSafety(true); logEvent('safety', {}); };
  const stoppedGetHelp = () => { setShowSafety(false); setScreen('home'); };

  if (unlocked === null) return <div className="app" />; // brief blank while we check the gate
  if (!unlocked) return <div className="app"><Gate onUnlock={() => setUnlocked(true)} /></div>;

  return (
    <div className="app">
      {/* status-bar notch breathing room is built into each screen's top padding */}
      {screen === 'intro' && <Intro letsGroom={letsGroom} />}
      {screen === 'home' && (
        <Home goDen={goDen} setQuickMode={setQuickMode} openListening={openListening} pickBreed={(b) => { setBreed(b); setScreen('steps'); }} />
      )}
      {screen === 'steps' && (
        <Steps breed={breed} doneCount={doneCount} done={done} stepIdx={stepIdx} goHome={goHome} openDetail={openDetail} setQuickMode={setQuickMode} openListening={openListening} />
      )}
      {screen === 'detail' && (
        <Detail i={selStep} backToList={backToList} gotItNext={gotItNext} />
      )}
      {screen === 'quick' && (
        <Quick goHome={goHome} triggerSafety={triggerSafety} breed={breed} />
      )}
      {screen === 'progress' && <Den backFromDen={backFromDen} photos={photos} openSurvey={() => setShowSurvey(true)} />}

      {showSafety && <Safety stoppedGetHelp={stoppedGetHelp} closeSafety={() => setShowSafety(false)} />}
      {showListening && <Listening close={() => setShowListening(false)} />}
      {showSurvey && <Survey sessionId={getSessionId()} close={() => setShowSurvey(false)} />}
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
      {err && <div style={{ fontFamily: FFB, fontWeight: 700, fontSize: 13, color: 'var(--coral)', marginTop: 10 }}>That code didn&apos;t work — check with your instructor.</div>}
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
        {row(2, 'var(--coral)', '#fff', 'Look at your photo & coach you — never grade you')}
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
// SCREEN 2 — Home
// ============================================================
function Home({ goDen, setQuickMode, openListening, pickBreed }: { goDen: () => void; setQuickMode: () => void; openListening: () => void; pickBreed: (b: string) => void }) {
  const chip = (label: string, active?: boolean, muted?: boolean, onClick?: () => void) => (
    <div onClick={onClick ?? (() => pickBreed(label))} style={{ background: active ? 'var(--primary)' : '#fff', border: BORDER, borderRadius: 999, padding: '9px 15px', fontWeight: 800, fontSize: 14, color: muted ? 'var(--muted-2)' : INK, cursor: 'pointer' }}>{label}</div>
  );
  return (
    <div className="scr">
      {/* topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '34px 18px 10px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img onClick={goDen} src={MASCOT} alt="Buddy" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: BORDER, background: '#fff', cursor: 'pointer' }} />
        <div onClick={goDen} style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '.05em' }}>preview</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--green)', border: BORDER, borderRadius: 999, padding: '5px 11px', fontFamily: FFD, fontWeight: 800, fontSize: 14, color: '#fff' }}>7🔥</div>
        </div>
      </div>
      {/* switcher */}
      <div style={{ margin: '6px 18px 0', background: '#fff', border: BORDER, borderRadius: 16, padding: 4, display: 'flex', boxShadow: HARD }}>
        <div style={{ flex: 1, textAlign: 'center', background: 'var(--primary)', borderRadius: 12, padding: 10, fontFamily: FFD, fontWeight: 800, fontSize: 15, color: INK }}>Guided groom</div>
        <div onClick={setQuickMode} style={{ flex: 1, textAlign: 'center', padding: 10, fontFamily: FFD, fontWeight: 800, fontSize: 15, color: 'var(--muted-2)', cursor: 'pointer' }}>Quick question</div>
      </div>
      <div className="gbsc scroll" style={{ padding: '0 18px' }}>
        <div style={{ padding: '20px 0 0' }}>
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 24, color: INK, lineHeight: 1.1 }}>Who&apos;s on the table<br />today?</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted-1)', marginTop: 4 }}>Tell me the breed & coat, I&apos;ll build the plan.</div>
        </div>
        <div style={{ padding: '16px 0 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {chip('Goldendoodle', true)}
          {chip('Shih Tzu')}
          {chip('Lab')}
          {chip('+ more', false, true, () => pickBreed('Goldendoodle'))}
        </div>
        {/* "Pick up where you left off" resume card removed for the account-free
            demo (no persisted progress yet). Kept here for when sessions persist:
            <div onClick={startGroom} style={{ margin:'18px 0 0', background:'var(--primary-soft)', border:BORDER, borderRadius:18, padding:15, boxShadow:HARD, cursor:'pointer' }}>
              ...PICK UP WHERE YOU LEFT OFF · 5/9 · Maple · Goldendoodle · Next: scissor the face...
            </div> */}
        <div style={{ height: 18 }} />
      </div>
      {/* action bar */}
      <div style={{ padding: '14px 18px 22px', borderTop: BORDER, background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={setQuickMode} style={{ flex: 1, background: 'var(--neutral-fill)', border: BORDER, borderRadius: 14, padding: 14, fontWeight: 700, fontSize: 14, color: 'var(--muted-2)', cursor: 'pointer' }}>Ask Buddy anything…</div>
        <Mic big onClick={openListening} />
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 3 — Steps list
// ============================================================
function Steps({ breed, doneCount, done, stepIdx, goHome, openDetail, setQuickMode, openListening }: { breed: string; doneCount: number; done: boolean[]; stepIdx: number; goHome: () => void; openDetail: (i: number) => void; setQuickMode: () => void; openListening: () => void }) {
  return (
    <div className="scr">
      <div style={{ padding: '38px 18px 12px', background: 'var(--primary)', borderBottom: BORDER }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ChevronL size={22} onClick={goHome} />
            <div>
              <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 19, color: INK, lineHeight: 1 }}>{breed}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-deep)' }}>Full groom · teddy-bear face</div>
            </div>
          </div>
          <div style={{ background: INK, color: 'var(--primary)', fontFamily: FFD, fontWeight: 800, fontSize: 14, padding: '6px 11px', borderRadius: 12 }}>{doneCount}/9</div>
        </div>
      </div>
      <div className="gbsc scroll" style={{ padding: '14px 16px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {GROOM_STEPS.map((st, i) => {
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
      </div>
      <div style={{ padding: '13px 18px 22px', borderTop: BORDER, background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={setQuickMode} style={{ flex: 1, background: 'var(--neutral-fill)', border: BORDER, borderRadius: 14, padding: 13, fontWeight: 700, fontSize: 13, color: 'var(--muted-2)', cursor: 'pointer' }}>Ask about any step…</div>
        <Mic onClick={openListening} />
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 4 — Step detail (core value screen)
// ============================================================
function Detail({ i, backToList, gotItNext }: { i: number; backToList: () => void; gotItNext: () => void }) {
  const d = GROOM_STEPS[i] || GROOM_STEPS[0];
  return (
    <div className="scr">
      <div style={{ padding: '38px 18px 12px', background: 'var(--primary)', borderBottom: BORDER, display: 'flex', alignItems: 'center', gap: 10 }}>
        <ChevronL onClick={backToList} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--gold-deep)' }}>STEP {i + 1} OF 9</div>
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 20, color: INK, lineHeight: 1 }}>{d.t}</div>
        </div>
      </div>
      <div className="gbsc scroll" style={{ padding: '16px 16px 22px', display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div style={{ background: '#fff', border: BORDER, borderRadius: 16, padding: 14, boxShadow: HARD }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: INK, lineHeight: 1.45 }}>{d.quickRead}</div>
        </div>
        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
          <div style={{ flex: 'none', width: 30, height: 30, borderRadius: 9, background: 'var(--primary)', border: BORDER2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div>
            <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 14, color: INK }}>Do this next</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4A3C30', lineHeight: 1.4 }}>{d.doNext}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
          <div style={{ flex: 'none', width: 30, height: 30, borderRadius: 9, background: 'var(--coral)', border: BORDER2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: FFD, fontWeight: 800, color: '#fff', fontSize: 15 }}>!</span>
          </div>
          <div>
            <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 14, color: INK }}>Buddy&apos;s cue</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4A3C30', lineHeight: 1.4 }}>{d.cue}</div>
          </div>
        </div>
        <div style={{ border: BORDER, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ background: STRIPES, height: 104, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ font: '600 11px ui-monospace,monospace', color: 'var(--muted-gold)', background: 'var(--cream)', padding: '4px 8px', borderRadius: 6, border: '1.5px solid var(--ink)' }}>reference: {d.ref}</span>
          </div>
        </div>
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
      </div>
      <div style={{ padding: '12px 16px 22px', borderTop: BORDER, background: '#fff', display: 'flex', gap: 10 }}>
        <button onClick={backToList} style={{ flex: 'none', background: '#fff', border: BORDER, borderRadius: 14, padding: '13px 16px', fontFamily: FFD, fontWeight: 800, fontSize: 14, color: INK, boxShadow: HARD2, cursor: 'pointer' }}>‹ Steps</button>
        <button onClick={gotItNext} style={{ flex: 1, background: 'var(--green)', border: BORDER, borderRadius: 14, padding: 13, fontFamily: FFD, fontWeight: 800, fontSize: 15, color: '#fff', boxShadow: HARD2, cursor: 'pointer' }}>Got it — next ✓</button>
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

function Quick({ goHome, triggerSafety, breed }: QuickProps) {
  // Lightweight session context the model gets (curriculum RAG is added server-side).
  const context = `Dog: a ${breed}.`;
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: { context },
        // Pilot access code (if the deploy set one). Read fresh per request so a
        // student who unlocks mid-session doesn't need a reload.
        headers: () => ({ 'x-access-code': localStorage.getItem('gb_access') ?? '' }),
      }),
    [context],
  );
  // sendAutomaticallyWhen: once the student answers the askQuestions card, the
  // tool result is filled and the model auto-continues to the feedback.
  const { messages, sendMessage, status, addToolResult } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const [input, setInput] = useState('');
  const [pending, setPending] = useState<{ url: string; mediaType: string; name: string; dark: boolean; blurry: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const busy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

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

  const hasInput = input.trim().length > 0 || !!pending;

  return (
    <div className="scr">
      {/* mode toggle */}
      <div style={{ padding: '34px 18px 0' }}>
        <div style={{ background: '#fff', border: BORDER, borderRadius: 16, padding: 4, display: 'flex', boxShadow: HARD }}>
          <div onClick={goHome} style={{ flex: 1, textAlign: 'center', padding: 10, fontFamily: FFD, fontWeight: 800, fontSize: 15, color: 'var(--muted-2)', cursor: 'pointer' }}>Guided groom</div>
          <div style={{ flex: 1, textAlign: 'center', background: 'var(--coral)', borderRadius: 12, padding: 10, fontFamily: FFD, fontWeight: 800, fontSize: 15, color: '#fff' }}>Quick question</div>
        </div>
      </div>

      {/* thread */}
      <div ref={scrollRef} className="gbsc scroll" style={{ padding: '14px 18px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ChatBubble role="assistant">
          I&apos;m right here — ask me anything, tap a button below, or snap a pic with the ➕. What&apos;s up?
        </ChatBubble>

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
                    return <div key={i} style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-2)' }}>Skipped — giving you my best read.</div>;
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
        <div style={{ height: 4 }} />
      </div>

      {/* suggestion chips — one-tap starts, no second box */}
      <div className="gbsc" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 18px 0' }}>
        <QuickChip label="What's next?" onClick={() => { if (!busy) { deliver('What should I do next?'); } }} />
        <QuickChip label="How do I…" onClick={() => prefill('How do I ')} />
        <QuickChip label="Is this okay?" onClick={() => prefill('Is this okay? ')} />
        <QuickChip label="Show me a reference" onClick={() => prefill('Show me a reference photo of ')} />
        <QuickChip label="🚨 Something's wrong" tone="red" onClick={triggerSafety} />
      </div>

      {/* attached-photo preview */}
      {pending && (
        <div style={{ padding: '8px 18px 0' }}>
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
                ? 'A bit dark and soft — more light and a steady hand help me see, but you can still send.'
                : pending.dark
                  ? 'A bit dark — more light helps me see, but you can still send.'
                  : 'A little blurry — hold steady for a sharper one, but you can still send.'}
            </div>
          )}
          <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: 'var(--muted-2)' }}>
            📸 Good light, fill the frame, hold steady. A front and a side shot help most.
          </div>
        </div>
      )}

      {/* chat bar: [+] · input · mic/send */}
      <div style={{ padding: '10px 18px 22px', borderTop: BORDER, background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => fileRef.current?.click()} aria-label="Add photo" style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', background: 'var(--neutral-fill)', border: BORDER, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: HARD2 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={INK} strokeWidth="3" strokeLinecap="round" /></svg>
        </button>
        <input
          ref={inputRef}
          className="gbin"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Buddy anything…"
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          style={{ flex: 1, background: 'var(--neutral-fill)', border: BORDER, borderRadius: 14, padding: 13, fontWeight: 700, fontSize: 14, color: INK, fontFamily: FFB, outline: 'none' }}
        />
        <button
          onClick={send}
          disabled={!hasInput || busy}
          aria-label="Send"
          style={{ flex: 'none', width: 50, height: 50, borderRadius: '50%', background: 'var(--coral)', border: BORDER3, boxShadow: HARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: hasInput && !busy ? 'pointer' : 'default', opacity: hasInput && !busy ? 1 : 0.4 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12h13M12 5l7 7-7 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {/* hidden picker behind the ➕ (camera on mobile, library on desktop) */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.heic,.heif"
        capture="environment"
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
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-deep)', lineHeight: 1.35 }}>&quot;Every groom we do together, you get a little sharper. Keep it up! 🐾&quot; — Buddy</div>
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
        <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 24, color: INK, textAlign: 'center', marginTop: 14, lineHeight: 1.1 }}>Let&apos;s pause — and get a person.</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#7A2E31', textAlign: 'center', lineHeight: 1.45, marginTop: 10 }}>A yelp + pulling away can mean a nail&apos;s cut too short or she&apos;s hurting. <b>This is one to hand off</b> — please stop and grab your instructor or a senior groomer now.</div>
        <div style={{ background: '#fff', border: BORDER, borderRadius: 16, padding: 13, marginTop: 16 }}>
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 13, color: 'var(--red-text)', marginBottom: 6 }}>While you wait</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#4A3C30', lineHeight: 1.4 }}>Keep her calm and still, gently check the paw for bleeding, don&apos;t keep cutting.</div>
        </div>
        <button onClick={stoppedGetHelp} style={{ width: '100%', marginTop: 16, background: 'var(--red)', border: BORDER3, borderRadius: 16, padding: 15, fontFamily: FFD, fontWeight: 800, fontSize: 17, color: '#fff', boxShadow: HARD, cursor: 'pointer' }}>I&apos;ve stopped — get help</button>
        <button onClick={closeSafety} style={{ width: '100%', marginTop: 10, background: 'transparent', border: 'none', fontFamily: FFB, fontWeight: 700, fontSize: 13, color: 'var(--muted-2)', cursor: 'pointer' }}>It was a false alarm</button>
      </div>
    </div>
  );
}

// ============================================================
// OVERLAY — Listening
// ============================================================
function Listening({ close }: { close: () => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'linear-gradient(180deg,#2B211A 0%,#3A2D22 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'gbPop .3s ease' }}>
      <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--primary)', position: 'absolute', top: 54 }}>Listening…</div>
      <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '3px solid rgba(255,195,43,.3)', animation: 'gbFloat 2s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', border: '3px solid rgba(255,195,43,.5)' }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MASCOT} alt="Buddy" style={{ width: 124, height: 124, borderRadius: '50%', objectFit: 'cover', border: '5px solid var(--primary)', background: '#fff', animation: 'gbFloat 2.4s ease-in-out infinite' }} />
      </div>
      <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 20, color: '#fff', marginTop: 34, textAlign: 'center', lineHeight: 1.25 }}>&quot;Buddy, the mats behind<br />her ears won&apos;t budge…&quot;</div>
      <div style={{ display: 'flex', gap: 4, marginTop: 18 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', animation: 'gbType 1.2s infinite' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', animation: 'gbType 1.2s infinite .2s' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', animation: 'gbType 1.2s infinite .4s' }} />
      </div>
      <div onClick={close} style={{ marginTop: 40, width: 72, height: 72, borderRadius: '50%', background: 'var(--coral)', border: '3px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <MicIcon size={28} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.6)', marginTop: 12 }}>Tap to send</div>
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
