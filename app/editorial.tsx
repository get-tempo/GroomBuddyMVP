import Link from 'next/link';
import { Fraunces } from 'next/font/google';
import { PhoneFrame, DOODLES } from './marketing-ui';

// The editorial design system shared by the marketing pages (/welcome, /diy):
// brand yellow/espresso/cream with the tonal rule (deep text on bright blocks,
// light text on deep blocks), Fraunces serif display, chat pill on the hero
// seam, and the animated app-walkthrough demo.

const fraunces = Fraunces({ subsets: ['latin'], axes: ['opsz', 'SOFT', 'WONK'] });
// Hard-pin the variation axes: Fraunces' auto optical sizing swaps in
// display-cut glyphs (the curly descender 'f') at large sizes. Vetoed.
export const SERIF: React.CSSProperties = {
  fontFamily: fraunces.style.fontFamily,
  fontOpticalSizing: 'none',
  fontVariationSettings: "'opsz' 14, 'SOFT' 0, 'WONK' 0",
};

// palette
export const CREAM = '#fff8ee';
export const INK = '#2b211a';
export const CLAY = '#ffc32b';       // bright accent (Buddy yellow)
export const DEEP = '#2b211a';       // deep block / text on yellow
export const LIGHT = '#ffefc6';      // light text on deep, pale-butter bands
export const TINT = '#f4ece0';       // subtle section tint
export const MUT = '#6b5d4e';        // muted body on cream
export const GOLD = '#9a7b3f';       // serif accents on cream

const FFD = 'var(--font-display)';

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} style={{ color: DEEP, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>{children}</a>;
}

export function Nav({ links }: { links: { href: string; label: string }[] }) {
  return (
    <nav style={{ background: LIGHT, padding: '16px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/logo-buddy.png" alt="" style={{ width: 40, height: 'auto', display: 'block' }} />
        <span style={{ ...SERIF, fontWeight: 600, fontSize: 24, color: DEEP, letterSpacing: 0.2 }}>grooming buddy</span>
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
        {links.map(l => <NavLink key={l.href} href={l.href}>{l.label}</NavLink>)}
        <Link href="/" style={{ background: CLAY, color: INK, borderRadius: 999, padding: '10px 20px', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: `0 2px 0 ${INK}` }}>Open Buddy</Link>
      </div>
    </nav>
  );
}

// The hero chat pill: the actual product, straddling the color seam.
export function ChatPill({ text = "Hi, I'm Buddy. Stuck mid-groom? Just ask." }: { text?: string }) {
  return (
    <Link href="/" aria-label="Open Grooming Buddy and ask a question" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: `2px solid ${DEEP}`, borderRadius: 999, padding: '15px 20px', boxShadow: `0 4px 0 ${DEEP}`, textDecoration: 'none', maxWidth: 620, width: '100%' }}>
      <span style={{ flex: 1, fontSize: 'clamp(14px, 2.2vw, 17px)', fontWeight: 600, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {text}
        <span className="gbCaret" style={{ background: INK }} />
      </span>
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M12 5v14M5 12h14" stroke={MUT} strokeWidth="2.4" strokeLinecap="round" /></svg>
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><rect x="9" y="3" width="6" height="11" rx="3" stroke={MUT} strokeWidth="2.2" fill="none" /><path d="M5 11a7 7 0 0014 0M12 18v3" stroke={MUT} strokeWidth="2.2" strokeLinecap="round" fill="none" /></svg>
      <span style={{ flex: 'none', width: 34, height: 34, borderRadius: '50%', background: CLAY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path d="M12 19V6M6 12l6-6 6 6" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
      </span>
    </Link>
  );
}

// Organic blob with a doodle inside, editorial-recolored (the old sticker
// zigzag visual, minus the tilt-and-hard-shadow look).
export function EBlob({ kind, tint = LIGHT, size = 120 }: {
  kind: keyof typeof DOODLES; tint?: string; size?: number;
}) {
  return (
    <div aria-hidden style={{ width: size, height: size, background: tint, border: `2px solid ${DEEP}`, boxShadow: `0 3px 0 ${DEEP}`, borderRadius: '58% 42% 55% 45% / 45% 55% 45% 55%', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
      <span style={{ width: size * 0.5, height: size * 0.5, color: DEEP }}>{DOODLES[kind]}</span>
    </div>
  );
}

// Numbered zigzag step (alternate `flip` per row).
export function EStepRow({ n, title, doodle, tint, flip, children }: {
  n: number; title: string; doodle: keyof typeof DOODLES; tint?: string; flip?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px 36px', flexDirection: flip ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
      <div style={{ flex: '1 1 340px', maxWidth: 620, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        <div style={{ flex: 'none', width: 56, height: 56, borderRadius: '50%', background: CLAY, border: `2px solid ${DEEP}`, boxShadow: `0 3px 0 ${DEEP}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...SERIF, fontWeight: 600, fontSize: 26, color: DEEP }}>
          {n}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6, color: DEEP }}>{title}</div>
          <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.6, color: MUT }}>{children}</div>
        </div>
      </div>
      <EBlob kind={doodle} tint={tint} />
    </div>
  );
}

const miniChip = (label: string, tapped?: boolean) => (
  <div key={label} className={tapped ? 'gbTapChip' : undefined} style={{ background: '#fff', border: `2px solid ${INK}`, borderRadius: 999, padding: '7px 6px', fontFamily: FFD, fontWeight: 800, fontSize: 11.5, color: INK, textAlign: 'center' }}>{label}</div>
);
const videoCard = (
  <div style={{ border: `2px solid ${INK}`, borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
    <div style={{ background: INK, height: 58, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ width: 30, height: 30, borderRadius: '50%', background: CLAY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden><path d="M8 5v14l12-7-12-7z" fill={INK} /></svg>
      </span>
    </div>
    <div style={{ padding: '6px 9px', fontSize: 10.5, fontWeight: 700, color: MUT, lineHeight: 1.35 }}>
      How to scissor your dog&apos;s ears · Grooming By Rudy · plays from 0:23
    </div>
  </div>
);

// The real app flow, replicated: intake -> building -> plan -> step detail
// (with the real video-bank card) -> asking about the step. 26s CSS loop.
export function ChatDemo() {
  const planRow = (n: number, t: string, tapped?: boolean) => (
    <div key={n} className={tapped ? 'gbTapRow' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `2px solid ${INK}`, borderRadius: 12, padding: '7px 9px' }}>
      <span style={{ flex: 'none', width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)', border: `2px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FFD, fontWeight: 800, fontSize: 10.5 }}>{n}</span>
      <span style={{ fontFamily: FFD, fontWeight: 800, fontSize: 11.5, color: INK, flex: 1 }}>{t}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><path d="M9 6l6 6-6 6" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
    </div>
  );
  return (
    <PhoneFrame tall>
      <div style={{ position: 'relative', flex: 1 }}>
        {/* 1 · intake */}
        <div className="gbScr gbScr1">
          <div style={{ background: 'var(--primary)', border: `2px solid ${INK}`, borderRadius: 12, padding: '8px 11px', fontFamily: FFD, fontWeight: 800, fontSize: 13, color: INK }}>Who&apos;s on the table?</div>
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 12, color: INK }}>Breed</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {miniChip('Goldendoodle', true)}
            {miniChip('Poodle')}
            {miniChip('Shih Tzu')}
            {miniChip('Maltese')}
            {miniChip('Schnauzer')}
            {miniChip('Other / mixed')}
          </div>
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 12, color: INK, marginTop: 4 }}>How&apos;s the coat?</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {miniChip('A few tangles')}
            {miniChip('Brushed out')}
          </div>
        </div>
        {/* 2 · building the plan */}
        <div className="gbScr gbScr2" style={{ alignItems: 'center', justifyContent: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/Smileydogfunny.jpg" alt="" style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${INK}` }} />
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 14, color: INK }}>Building Willow&apos;s plan…</div>
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'gbType 1.2s infinite' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'gbType 1.2s infinite .2s' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'gbType 1.2s infinite .4s' }} />
          </div>
        </div>
        {/* 3 · the plan, tapping a step */}
        <div className="gbScr gbScr3">
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 12.5, color: MUT }}>Willow · Goldendoodle · medium teddy</div>
          {planRow(1, 'Nails, pads, and sanitary')}
          {planRow(2, 'Bath and blow-dry')}
          {planRow(3, 'Full brush-out and de-mat')}
          {planRow(4, 'Clipper the body')}
          {planRow(5, 'Tidy and clean the ears', true)}
          {planRow(6, 'Scissor the face')}
        </div>
        {/* 4 · step detail with the video */}
        <div className="gbScr gbScr4">
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 14.5, color: INK }}>Tidy and clean the ears</div>
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 11, color: MUT, marginTop: -5 }}>Step 5 of 9</div>
          <div style={{ background: '#fff', border: `2px solid ${INK}`, borderRadius: 12, padding: '8px 10px', fontSize: 11.5, fontWeight: 600, lineHeight: 1.45, color: INK }}>
            1. Pluck loose inner-ear hair, a little at a time.<br />
            2. Wipe with ear cleaner on a cotton pad.<br />
            3. Scissor the edges to follow the ear&apos;s shape.
          </div>
          <div style={{ background: 'var(--primary-soft)', border: `2px solid ${INK}`, borderRadius: 10, padding: '6px 9px', fontSize: 10.5, fontWeight: 700, color: INK }}>
            Pro tip: work with the ear resting flat in your palm, never mid-air.
          </div>
          {videoCard}
        </div>
        {/* 5 · asking about the step */}
        <div className="gbScr gbScr5">
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 12.5, color: MUT }}>Tidy and clean the ears · Ask Buddy</div>
          <div className="gbS5Q" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ maxWidth: '88%', background: CLAY, border: `2px solid ${INK}`, borderRadius: 14, borderBottomRightRadius: 4, padding: '8px 11px', fontSize: 12, fontWeight: 700, color: INK }}>
              How do I tidy the edges without nicking the leather?
            </div>
          </div>
          <div className="gbS5A" style={{ maxWidth: '94%', background: '#fff', border: `2px solid ${INK}`, borderRadius: 14, borderTopLeftRadius: 4, padding: '9px 12px', fontSize: 12, fontWeight: 600, lineHeight: 1.5, color: INK }}>
            Comb the ear hair straight down and hold the ear so you can <b>feel</b>
            {' '}where the leather ends, that&apos;s your safety line. Thinning
            shears, parallel to the edge, small bites from base to tip, angled
            away from the leather so any slip goes into air, not skin.
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
