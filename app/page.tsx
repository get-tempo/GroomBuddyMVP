'use client';

import { useEffect, useRef, useState } from 'react';
import { GROOM_STEPS } from '@/data/groom-steps';
import { logEvent, getSessionId } from '@/lib/analytics';

// ============================================================
// Grooming Buddy — single-screen state machine (per the handoff).
// Screens: intro · home · steps · detail · quick · photo · progress(Den)
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

type Screen = 'intro' | 'home' | 'steps' | 'detail' | 'quick' | 'photo' | 'progress';
type QuickAction = null | 'next' | 'how' | 'ok' | 'showme' | 'free';

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
function CameraIcon({ stroke = INK, size = 22 }: { stroke?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="3" stroke={stroke} strokeWidth="2.2" />
      <circle cx="12" cy="12.5" r="3.3" stroke={stroke} strokeWidth="2.2" />
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

// ---------- a Buddy chat bubble with avatar ----------
function BuddyBubble({ children, soft }: { children: React.ReactNode; soft?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'gbPop .3s ease' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MASCOT} alt="Buddy" style={{ flex: 'none', width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: BORDER, background: '#fff' }} />
      <div style={{ background: soft ? 'var(--primary-soft)' : '#fff', border: BORDER, borderRadius: 16, borderTopLeftRadius: 4, padding: '12px 13px', boxShadow: HARD2 }}>
        {children}
      </div>
    </div>
  );
}

export default function BuddyApp() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [stepIdx, setStepIdx] = useState(0); // fresh groom: start at step 1
  const [done, setDone] = useState<boolean[]>(Array(GROOM_STEPS.length).fill(false));
  const [selStep, setSelStep] = useState(0);
  const [breed, setBreed] = useState('Goldendoodle'); // set by the breed chips on Home
  const [quickAction, setQuickAction] = useState<QuickAction>(null);
  const [quickSent, setQuickSent] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [quickReply, setQuickReply] = useState<string | null>(null);
  const [quickImages, setQuickImages] = useState<{ url: string; caption: string }[]>([]);
  const [quickLoading, setQuickLoading] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [showListening, setShowListening] = useState(false);
  const [prevScreen, setPrevScreen] = useState<Screen>('home');

  // photo coaching
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoReply, setPhotoReply] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // session "portfolio" preview (photos checked this session) + survey overlay
  const [photos, setPhotos] = useState<string[]>([]);
  const [showSurvey, setShowSurvey] = useState(false);
  const triggerCamera = () => fileRef.current?.click();

  // Deep-link to a screen via ?s=home|steps|detail|quick|photo|progress
  // (handy for demos and screenshots). Runs after mount to avoid hydration drift.
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('s') as Screen | null;
    const valid: Screen[] = ['intro', 'home', 'steps', 'detail', 'quick', 'photo', 'progress'];
    if (s && valid.includes(s)) setScreen(s);
  }, []);

  const doneCount = done.filter(Boolean).length;
  const ctx = `Dog: a ${breed}. Full groom, teddy-bear face. Current step: ${GROOM_STEPS[stepIdx].t}.`;

  // ---- real Buddy call (falls back to canned on error / no key) ----
  async function askBuddy(mode: string, text: string, imageDataUrl?: string) {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, text, context: ctx, imageDataUrl }),
    });
    if (!res.ok) throw new Error('ask failed');
    return (await res.json()) as { text: string; images: { url: string; caption: string }[] };
  }

  // ---- navigation / handlers (mirror the prototype) ----
  const letsGroom = () => setScreen('home');
  const goHome = () => setScreen('home');
  const backToList = () => setScreen('steps');
  const openDetail = (i: number) => { setSelStep(i); setScreen('detail'); logEvent('step_open', { step: i + 1, title: GROOM_STEPS[i].t }); };
  const resetQuick = () => { setQuickAction(null); setQuickSent(false); setQuickInput(''); setQuickReply(null); setQuickImages([]); };
  const setQuickMode = () => { resetQuick(); setScreen('quick'); };
  const backToQuick = () => setScreen('quick');
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

  const pick = (a: QuickAction) => { setQuickAction(a); setQuickSent(false); setQuickReply(null); setQuickImages([]); setQuickInput(''); };

  async function sendQuick(mode: string) {
    setQuickSent(true);
    setQuickLoading(true);
    logEvent('quick_question', { mode, text: quickInput || defaultQuery(mode) });
    try {
      const r = await askBuddy(mode, quickInput || defaultQuery(mode));
      setQuickReply(r.text);
      setQuickImages(r.images || []);
    } catch {
      setQuickReply(null); // null => render the designed canned fallback
    } finally {
      setQuickLoading(false);
    }
  }

  function openPhoto() { setScreen('photo'); }

  async function onPhotoPicked(file: File) {
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    setPhotos((prev) => [url, ...prev]); // session portfolio preview
    setPhotoReply(null);
    setPhotoLoading(true);
    logEvent('photo_check', {});
    try {
      const dataUrl = await fileToDataUrl(file);
      const r = await askBuddy('photo', '', dataUrl);
      setPhotoReply(r.text);
    } catch {
      setPhotoReply(null);
    } finally {
      setPhotoLoading(false);
    }
  }

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
        <Quick
          goHome={goHome} openPhoto={openPhoto} openListening={openListening}
          quickAction={quickAction} quickSent={quickSent} quickInput={quickInput}
          setQuickInput={setQuickInput} quickReply={quickReply} quickImages={quickImages}
          quickLoading={quickLoading} pick={pick} sendQuick={sendQuick}
          triggerSafety={triggerSafety} currentDoNext={GROOM_STEPS[stepIdx].doNext}
          currentStepTitle={GROOM_STEPS[stepIdx].t}
        />
      )}
      {screen === 'photo' && (
        <Photo backToQuick={backToQuick} photoUrl={photoUrl} photoReply={photoReply} photoLoading={photoLoading} triggerCamera={triggerCamera} />
      )}
      {screen === 'progress' && <Den backFromDen={backFromDen} photos={photos} openSurvey={() => setShowSurvey(true)} />}

      {showSafety && <Safety stoppedGetHelp={stoppedGetHelp} closeSafety={() => setShowSafety(false)} />}
      {showListening && <Listening close={() => setShowListening(false)} />}
      {showSurvey && <Survey sessionId={getSessionId()} close={() => setShowSurvey(false)} />}

      {/* hidden file input shared by the photo paths */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) { openPhoto(); onPhotoPicked(f); } if (fileRef.current) fileRef.current.value = ''; }}
      />
    </div>
  );
}

function defaultQuery(mode: string) {
  if (mode === 'how') return 'get a clean teddy-bear face';
  if (mode === 'ok') return "tell me what you're seeing";
  if (mode === 'showme') return 'a finished teddy-bear face';
  return 'help me out';
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
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
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div onClick={goDen} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--green)', border: BORDER, borderRadius: 999, padding: '5px 11px', fontFamily: FFD, fontWeight: 800, fontSize: 14, color: '#fff', cursor: 'pointer' }}>7🔥</div>
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
// SCREEN 5 — Quick mode
// ============================================================
type QuickProps = {
  goHome: () => void; openPhoto: () => void; openListening: () => void;
  quickAction: QuickAction; quickSent: boolean; quickInput: string;
  setQuickInput: (s: string) => void; quickReply: string | null;
  quickImages: { url: string; caption: string }[]; quickLoading: boolean;
  pick: (a: QuickAction) => void; sendQuick: (mode: string) => void;
  triggerSafety: () => void; currentDoNext: string; currentStepTitle: string;
};
function Quick(p: QuickProps) {
  const tile = (label: React.ReactNode, onClick: () => void, bg: string, glyph: React.ReactNode, full?: boolean) => (
    <div onClick={onClick} style={{ gridColumn: full ? '1 / -1' : undefined, background: bg, border: BORDER, borderRadius: 16, padding: '14px 12px', boxShadow: HARD, display: 'flex', flexDirection: full ? 'row' : 'column', alignItems: full ? 'center' : undefined, gap: full ? 10 : 6, cursor: 'pointer' }}>
      {glyph}
      <span style={{ fontFamily: FFD, fontWeight: 800, fontSize: 15, color: INK, lineHeight: 1.05 }}>{label}</span>
    </div>
  );
  const inputRow = (label: string, color: string, placeholder: string, btnBg: string, btnColor: string, btnLabel: string, mode: string) => (
    <div style={{ marginTop: 14, animation: 'gbPop .3s ease' }}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color, marginBottom: 7 }}>{label}</div>
      <div style={{ display: 'flex', gap: 9 }}>
        <input className="gbin" value={p.quickInput} onChange={(e) => p.setQuickInput(e.target.value)} placeholder={placeholder} onKeyDown={(e) => { if (e.key === 'Enter') p.sendQuick(mode); }} style={{ flex: 1, background: '#fff', border: BORDER, borderRadius: 14, padding: 13, fontWeight: 700, fontSize: 13, color: INK, fontFamily: FFB, outline: 'none' }} />
        <button onClick={() => p.sendQuick(mode)} style={{ flex: 'none', background: btnBg, border: BORDER, borderRadius: 14, padding: '0 16px', fontFamily: FFD, fontWeight: 800, color: btnColor, cursor: 'pointer' }}>{btnLabel}</button>
      </div>
    </div>
  );

  return (
    <div className="scr">
      <div style={{ padding: '34px 18px 0' }}>
        <div style={{ background: '#fff', border: BORDER, borderRadius: 16, padding: 4, display: 'flex', boxShadow: HARD }}>
          <div onClick={p.goHome} style={{ flex: 1, textAlign: 'center', padding: 10, fontFamily: FFD, fontWeight: 800, fontSize: 15, color: 'var(--muted-2)', cursor: 'pointer' }}>Guided groom</div>
          <div style={{ flex: 1, textAlign: 'center', background: 'var(--coral)', borderRadius: 12, padding: 10, fontFamily: FFD, fontWeight: 800, fontSize: 15, color: '#fff' }}>Quick question</div>
        </div>
      </div>
      <div className="gbsc scroll" style={{ padding: '14px 18px 16px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MASCOT} alt="Buddy" style={{ flex: 'none', width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: BORDER, background: '#fff' }} />
          <div style={{ background: '#fff', border: BORDER, borderRadius: 16, borderTopLeftRadius: 4, padding: '11px 13px', fontSize: 14, fontWeight: 700, color: INK, boxShadow: HARD2 }}>I&apos;m right here — tap a button, snap a pic, or just talk to me. What&apos;s up?</div>
        </div>

        {/* photo incentive */}
        <div onClick={p.openPhoto} style={{ marginTop: 14, background: 'var(--primary)', border: BORDER, borderRadius: 16, padding: '13px 14px', boxShadow: HARD, display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}>
          <div style={{ flex: 'none', width: 40, height: 40, borderRadius: 11, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CameraIcon stroke="var(--primary)" /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 15, color: INK, lineHeight: 1.05 }}>📸 Show me & get specific advice</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-deep)' }}>The more I can see, the better I can help. Snap a pic anytime.</div>
          </div>
        </div>

        {/* action grid */}
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {tile('What do I do next?', () => p.pick('next'), p.quickAction === 'next' ? 'var(--primary)' : '#fff',
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12h12M12 6l6 6-6 6" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
          {tile(<>How&apos;s it looking? 📷</>, p.openPhoto, '#fff', <CameraIcon />)}
          {tile('How do I…', () => p.pick('how'), p.quickAction === 'how' ? 'var(--primary)' : '#fff',
            <span style={{ fontFamily: FFD, fontWeight: 800, fontSize: 18, color: INK }}>?</span>)}
          {tile('Wait — is this okay?', () => p.pick('ok'), p.quickAction === 'ok' ? 'var(--red-tint)' : '#fff',
            <span style={{ fontFamily: FFD, fontWeight: 800, fontSize: 18, color: 'var(--red-text)' }}>!</span>)}
          {tile('Show me one (reference photo)', () => p.pick('showme'), p.quickAction === 'showme' ? 'var(--primary)' : '#fff', <CameraIcon />, true)}
        </div>

        {/* contextual results */}
        {p.quickAction === 'next' && (
          <div style={{ marginTop: 14 }}>
            <BuddyBubble soft>
              <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 13, color: 'var(--muted-gold)', marginBottom: 3 }}>Next: {p.currentStepTitle.toLowerCase()}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: INK, lineHeight: 1.4 }}>{p.currentDoNext}</div>
            </BuddyBubble>
          </div>
        )}

        {p.quickAction === 'how' && !p.quickSent && inputRow('How do I… · tell me what', 'var(--muted-gold)', 'e.g. get a clean teddy-bear face', 'var(--primary)', INK, 'Ask', 'how')}
        {p.quickAction === 'how' && p.quickSent && (
          <div style={{ marginTop: 14 }}><BuddyBubble><Reply loading={p.quickLoading} reply={p.quickReply} canned="Comb the hair forward, then shape a round circle — tiny snips, comb, look. Curved shears, tips away from the eyes. Want me to show you a reference or look at a pic?" /></BuddyBubble></div>
        )}

        {p.quickAction === 'ok' && !p.quickSent && (
          <div style={{ marginTop: 14, animation: 'gbPop .3s ease' }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--red-text)', marginBottom: 7 }}>Is this okay? · what&apos;s worrying you</div>
            <div style={{ display: 'flex', gap: 9 }}>
              <input className="gbin" value={p.quickInput} onChange={(e) => p.setQuickInput(e.target.value)} placeholder="tell me what you're seeing…" onKeyDown={(e) => { if (e.key === 'Enter') p.sendQuick('ok'); }} style={{ flex: 1, background: '#fff', border: BORDER, borderRadius: 14, padding: 13, fontWeight: 700, fontSize: 13, color: INK, fontFamily: FFB, outline: 'none' }} />
              <button onClick={() => p.sendQuick('ok')} style={{ flex: 'none', background: 'var(--coral)', border: BORDER, borderRadius: 14, padding: '0 16px', fontFamily: FFD, fontWeight: 800, color: '#fff', cursor: 'pointer' }}>Ask</button>
            </div>
            <button onClick={p.triggerSafety} style={{ marginTop: 9, width: '100%', background: 'var(--red-tint)', border: BORDER, borderRadius: 14, padding: 11, fontFamily: FFD, fontWeight: 800, fontSize: 13, color: 'var(--red-text)', cursor: 'pointer' }}>She yelped & pulled her paw away →</button>
          </div>
        )}
        {p.quickAction === 'ok' && p.quickSent && (
          <div style={{ marginTop: 14 }}><BuddyBubble><Reply loading={p.quickLoading} reply={p.quickReply} canned="Walk me through it. If she's hurting, bleeding, or really stressed, we pause — no question. Snap a pic and I'll take a look with you." /></BuddyBubble></div>
        )}

        {p.quickAction === 'showme' && !p.quickSent && inputRow('Show me one · describe what you want to see', 'var(--muted-gold)', 'e.g. a finished teddy-bear face', 'var(--primary)', INK, 'Show', 'showme')}
        {p.quickAction === 'showme' && p.quickSent && (
          <div style={{ marginTop: 14, animation: 'gbPop .3s ease' }}>
            {p.quickImages.length > 0 ? (
              p.quickImages.map((im, k) => (
                <figure key={k} style={{ margin: k ? '10px 0 0' : 0 }}>
                  <div style={{ border: BORDER, borderRadius: 14, overflow: 'hidden', boxShadow: HARD }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={im.url} alt={im.caption} style={{ width: '100%', display: 'block' }} />
                  </div>
                  <figcaption style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted-1)', marginTop: 8, textAlign: 'center' }}>{im.caption}</figcaption>
                </figure>
              ))
            ) : (
              <>
                <div style={{ border: BORDER, borderRadius: 14, overflow: 'hidden', boxShadow: HARD }}>
                  <div style={{ background: STRIPES, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ font: '600 11px ui-monospace,monospace', color: 'var(--muted-gold)', background: 'var(--cream)', padding: '4px 8px', borderRadius: 6, border: '1.5px solid var(--ink)' }}>reference: {p.quickInput || 'finished teddy-bear face'}</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted-1)', marginTop: 8, textAlign: 'center' }}>Round muzzle, soft cheeks, no corners at the eyes 🐾</div>
              </>
            )}
          </div>
        )}
        <div style={{ height: 8 }} />
      </div>
      <div style={{ padding: '13px 18px 22px', borderTop: BORDER, background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
        <input className="gbin" value={p.quickAction === 'free' ? p.quickInput : ''} onFocus={() => p.pick('free')} onChange={(e) => p.setQuickInput(e.target.value)} placeholder="Or type it…" onKeyDown={(e) => { if (e.key === 'Enter') p.sendQuick('free'); }} style={{ flex: 1, background: 'var(--neutral-fill)', border: BORDER, borderRadius: 14, padding: 13, fontWeight: 700, fontSize: 13, color: INK, fontFamily: FFB, outline: 'none' }} />
        <Mic onClick={p.openListening} />
      </div>
      {p.quickAction === 'free' && p.quickSent && (
        <div style={{ position: 'absolute', left: 18, right: 18, bottom: 86 }}><BuddyBubble><Reply loading={p.quickLoading} reply={p.quickReply} canned="I'm right here. Tell me the breed, the step, and what you're seeing, and I'll talk you through it." /></BuddyBubble></div>
      )}
    </div>
  );
}

function Reply({ loading, reply, canned }: { loading: boolean; reply: string | null; canned: string }) {
  if (loading) return <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted-2)' }}>Buddy&apos;s thinking…</span>;
  return <div style={{ fontSize: 14, fontWeight: 600, color: INK, lineHeight: 1.45 }}>{reply ?? canned}</div>;
}

// ============================================================
// SCREEN 6 — Photo coaching
// ============================================================
function Photo({ backToQuick, photoUrl, photoReply, photoLoading, triggerCamera }: { backToQuick: () => void; photoUrl: string | null; photoReply: string | null; photoLoading: boolean; triggerCamera: () => void }) {
  return (
    <div className="scr">
      <div style={{ padding: '38px 18px 12px', borderBottom: BORDER, background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
        <ChevronL onClick={backToQuick} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MASCOT} alt="Buddy" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: BORDER, background: '#fff' }} />
        <span style={{ fontFamily: FFD, fontWeight: 800, fontSize: 17, color: INK }}>Let&apos;s have a look together</span>
      </div>
      <div className="gbsc scroll" style={{ padding: '16px 16px 22px', display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div style={{ border: BORDER, borderRadius: 16, overflow: 'hidden', boxShadow: HARD }}>
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="your photo" style={{ width: '100%', display: 'block' }} />
          ) : (
            <div style={{ background: STRIPES, height: 158, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ font: '600 11px ui-monospace,monospace', color: 'var(--muted-gold)', background: 'var(--cream)', padding: '4px 8px', borderRadius: 6, border: '1.5px solid var(--ink)' }}>your photo</span>
              <div style={{ position: 'absolute', right: 12, bottom: 12, background: 'var(--primary)', border: BORDER, borderRadius: 999, padding: '5px 12px', fontFamily: FFD, fontWeight: 800, fontSize: 12, color: INK }}>just now</div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MASCOT} alt="Buddy" style={{ flex: 'none', width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: BORDER, background: '#fff' }} />
          <div style={{ background: '#fff', border: BORDER, borderRadius: 16, borderTopLeftRadius: 4, padding: 14, boxShadow: HARD }}>
            {photoLoading ? (
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted-2)' }}>Having a look…</div>
            ) : photoReply ? (
              <div style={{ fontSize: 14, fontWeight: 700, color: INK, lineHeight: 1.45 }}>{photoReply}</div>
            ) : (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: INK, lineHeight: 1.45 }}>Oh that&apos;s <b>coming along really nicely</b> — the muzzle&apos;s nice and round! 🎉</div>
                <div style={{ height: 1, background: '#EADFCB', margin: '11px 0' }} />
                <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 8 }}><span style={{ color: 'var(--green)', fontWeight: 900, fontSize: 15 }}>✓</span><span style={{ fontSize: 13, fontWeight: 600, color: '#4A3C30', lineHeight: 1.4 }}>Cheeks are even — symmetry&apos;s looking good.</span></div>
                <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}><span style={{ color: 'var(--coral)', fontWeight: 900, fontSize: 15 }}>→</span><span style={{ fontSize: 13, fontWeight: 600, color: '#4A3C30', lineHeight: 1.4 }}>One little tuft under the left eye — comb it down and take the tiniest snip. You&apos;ve got this.</span></div>
              </>
            )}
          </div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-2)', textAlign: 'center' }}>No scores here — just the next small win.</div>
      </div>
      <div style={{ padding: '13px 16px 22px', borderTop: BORDER, background: '#fff', display: 'flex', gap: 10 }}>
        <button onClick={triggerCamera} style={{ flex: 1, background: '#fff', border: BORDER, borderRadius: 14, padding: 13, fontFamily: FFD, fontWeight: 800, fontSize: 14, color: INK, boxShadow: HARD2, cursor: 'pointer' }}>Another angle</button>
        <button onClick={backToQuick} style={{ flex: 1, background: 'var(--green)', border: BORDER, borderRadius: 14, padding: 13, fontFamily: FFD, fontWeight: 800, fontSize: 14, color: '#fff', boxShadow: HARD2, cursor: 'pointer' }}>Looks good ✓</button>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 7 — Den (progress)
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
