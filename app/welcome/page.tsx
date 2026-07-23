import type { Metadata } from 'next';
import Link from 'next/link';
import { Fraunces } from 'next/font/google';
import { ICONS, PhoneFrame } from '../marketing-ui';
import AnalyticsInit from '../analytics-init';

// Marketing landing page, "warm clay" editorial direction (askperi.ai-inspired
// structure: tonal color blocks, serif display, chat pill straddling the hero
// seam, collapsible FAQ). Sketch illustrations are intentionally absent until
// the AI-generated ink-sketch assets land; the hero is full-width deep until
// then (it goes back to a split with the artwork block after).
// Copy rule: everything on this page is for the END USER; how-we-built-it
// details stay out. No em dashes, no hype, no fabricated numbers.

const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '600'] });
// Pin optical sizing: Fraunces' auto opsz swaps in display-cut glyphs (the
// curly descender 'f') at large sizes. Julian vetoed the weird f.
const SERIF: React.CSSProperties = { fontFamily: fraunces.style.fontFamily, fontOpticalSizing: 'none' };

export const metadata: Metadata = {
  title: 'Grooming Buddy — an AI coach for grooming students and new groomers',
  description:
    'Buddy builds a step-by-step plan for the exact dog on your table, answers questions mid-groom, and gives straight feedback on your work. Free while in pilot.',
};

// palette: back to the app's own identity (Buddy yellow + espresso + cream),
// applied with the same tonal rule (deep text on bright blocks, light text on
// deep blocks). Julian 7/23: clay read "too professional."
const CREAM = '#fff8ee';
const INK = '#2b211a';
const CLAY = '#ffc32b';       // bright block (Buddy yellow)
const DEEP = '#2b211a';       // deep block / text on yellow
const LIGHT = '#ffefc6';      // light text on deep
const TINT = '#f4ece0';       // subtle section tint
const MUT = '#6b5d4e';        // muted body on cream
const GOLD = '#9a7b3f';       // serif accents on cream (yellow itself is too faint)

function ChatPill() {
  return (
    <Link href="/" aria-label="Open Grooming Buddy and ask a question" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: `2px solid ${DEEP}`, borderRadius: 999, padding: '15px 20px', boxShadow: `0 4px 0 ${DEEP}`, textDecoration: 'none', maxWidth: 620, width: '100%' }}>
      <span style={{ flex: 1, fontSize: 'clamp(14px, 2.2vw, 17px)', fontWeight: 600, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        Hi, I&apos;m Buddy. Stuck mid-groom? Just ask.
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

// Animated app demo: a real niche question, and Buddy's REAL answer (queried
// from the live system, lightly condensed) plus the actual video-bank card the
// app serves for ears. Pure CSS loop, see gbDemoQ/T/A in globals.css.
const FFD = 'var(--font-display)';
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
function ChatDemo() {
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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} style={{ color: DEEP, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>{children}</a>;
}

const FAQS = [
  { q: 'Is it really free?', a: 'Yes, everything, while we are in pilot. When paid plans arrive (around $19 a month), early users get a founding rate. No card, no signup today.' },
  { q: 'Does it replace my instructor?', a: 'No, and it will tell you so itself. Buddy coaches between instructors. Tight matting, a stressed dog, or anything medical gets one answer: stop and get a person.' },
  { q: 'Why not just use ChatGPT?', a: 'A general chatbot has no method. Buddy is grounded in a licensed grooming school’s curriculum, knows the dog you’re working on, and answers the way an instructor teaches.' },
  { q: 'Can it see my work?', a: 'Send a photo mid-groom and Buddy tells you what to fix, located on the dog, judged against the look you were going for.' },
  { q: 'What do I need to install?', a: 'Nothing. It runs in your phone’s browser. Open the link, add it to your home screen if you want, and start a groom.' },
  { q: 'Who built this?', a: 'A tiny team working alongside a state-licensed professional grooming school, whose students are piloting it right now. When an answer misses, you can tell us from inside the app.' },
];

export default function Welcome() {
  return (
    <main style={{ background: CREAM, color: INK, minHeight: '100dvh', overflowX: 'hidden' }}>
      <AnalyticsInit />

      {/* nav: pale butter (the page cream reads as plain white on screen),
          matching the promise band so the dark hero sits between two creams */}
      <nav style={{ background: LIGHT, padding: '16px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
        <span style={{ ...SERIF, fontWeight: 600, fontSize: 24, color: DEEP, letterSpacing: 0.2 }}>grooming buddy</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          <NavLink href="#how">How it works</NavLink>
          <NavLink href="#faq">FAQ</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#schools">For schools</NavLink>
          <Link href="/" style={{ background: CLAY, color: INK, borderRadius: 999, padding: '10px 20px', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: `0 2px 0 ${INK}` }}>Open Buddy</Link>
        </div>
      </nav>

      {/* hero: compact deep block so the next band peeks above the fold;
          chat pill on the bottom seam */}
      <header style={{ position: 'relative' }}>
        <div style={{ background: DEEP, padding: '64px 26px 96px' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            <h1 style={{ ...SERIF, fontWeight: 400, fontSize: 'clamp(40px, 5.4vw, 64px)', lineHeight: 1.08, color: LIGHT, margin: 0, maxWidth: 680 }}>
              A coach in your pocket, mid-groom.
            </h1>
            <p style={{ color: LIGHT, opacity: 0.75, fontSize: 17, fontWeight: 600, lineHeight: 1.6, margin: '18px 0 0', maxWidth: 540 }}>
              Buddy plans the groom for the exact dog on your table, answers while
              you work, and tells you straight what to fix.
            </p>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: -34, display: 'flex', justifyContent: 'center', padding: '0 22px' }}>
          <ChatPill />
        </div>
      </header>

      {/* promise band: pale butter, the golden roams free on it Peri-style */}
      <section style={{ background: LIGHT, color: DEEP, padding: '84px 26px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '10px 50px', justifyContent: 'center' }}>
          <div style={{ flex: '1 1 300px', maxWidth: 420, display: 'flex', justifyContent: 'center', alignSelf: 'flex-end' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/sketch-golden-pawprints.png" alt="Hand-drawn sketch of a golden retriever glancing back, leaving paw prints" style={{ width: 'min(470px, 98%)', height: 'auto', display: 'block' }} />
          </div>
          <div style={{ flex: '1 1 380px', maxWidth: 540, paddingBottom: 64 }}>
            <h2 style={{ ...SERIF, fontWeight: 600, fontSize: 'clamp(24px, 3vw, 32px)', lineHeight: 1.25, margin: '0 0 12px' }}>
              New breed on the table? Skip the trip to the book.
            </h2>
            <p style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.6, margin: 0, opacity: 0.85 }}>
              Every salon has a dog-eared breed book by the front desk. Buddy
              answers at the table instead: the full plan, the tools, and the
              technique for the exact dog in front of you, grounded in a real
              school&apos;s curriculum.
            </p>
            <div style={{ marginTop: 22 }}>
              <Link href="/" style={{ display: 'inline-block', background: CLAY, color: INK, borderRadius: 999, padding: '13px 26px', fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: `0 3px 0 ${DEEP}` }}>
                Try Buddy free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* who is Buddy for: serif question + list left, editorial right */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 26px 8px', display: 'flex', flexWrap: 'wrap', gap: '28px 70px', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 300px', maxWidth: 420 }}>
          <h2 style={{ ...SERIF, fontWeight: 600, fontSize: 'clamp(30px, 3.8vw, 42px)', color: GOLD, margin: '0 0 18px' }}>Who is Buddy for?</h2>
          <ul style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 8, fontWeight: 700, fontSize: 16, color: INK }}>
            <li>Grooming students</li>
            <li>New groomers, first two years</li>
            <li>Mobile groomers working solo</li>
            <li>Grooming schools</li>
          </ul>
        </div>
        <div style={{ flex: '1 1 380px', maxWidth: 560 }}>
          <p style={{ fontSize: 16.5, fontWeight: 600, lineHeight: 1.65, color: MUT, margin: 0 }}>
            The hardest part of learning to groom is the moment nobody is standing
            next to you. Buddy is for everyone still in that stretch: students
            between instructor check-ins, new groomers building speed and
            confidence, and solo mobile groomers with no senior groomer in the
            van. It saves the question for the moment it matters, on the dog it
            matters for.
          </p>
          <div style={{ margin: '14px 0 0', color: MUT }}>&mdash;</div>
          <p style={{ fontWeight: 800, fontSize: 17, color: INK, margin: '6px 0 0' }}>
            Buddy was made specifically for the grooming table.
          </p>
        </div>
      </section>

      {/* what Buddy is: four icon columns (trust, user-relevant only) */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '88px 26px 0' }}>
        <h2 style={{ ...SERIF, fontWeight: 600, fontSize: 'clamp(26px, 3.2vw, 34px)', color: DEEP, margin: 0, maxWidth: 720 }}>
          Helping grooming students and new groomers work with confidence.
        </h2>
      </section>
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '44px 26px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '48px 48px' }}>
        {[
          { i: ICONS.book, t: 'A real school behind it', d: 'Answers come from a licensed grooming school’s curriculum, in an instructor’s voice, never generic internet advice.' },
          { i: ICONS.paw, t: 'Knows breeds and coats', d: 'A doodle’s matting and a Schnauzer’s skirt get different answers, tools, and blade lengths.' },
          { i: ICONS.shield, t: 'Safety first, always', d: 'Brush before blades, tiny tips on nails, hot-blade checks, baked into every plan.' },
          { i: ICONS.person, t: 'Knows when you need a human', d: 'Tight matting, a stressed dog, anything medical: stop, get a person. It never replaces an instructor.' },
        ].map(a => (
          <div key={a.t}>
            <span aria-hidden style={{ display: 'block', width: 54, height: 54, color: GOLD, marginBottom: 16 }}>{a.i}</span>
            <div style={{ fontWeight: 800, fontSize: 16.5, color: DEEP, marginBottom: 6 }}>{a.t}</div>
            <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.6, color: MUT }}>{a.d}</div>
          </div>
        ))}
      </section>

      {/* how it works: steps left, the animated app demo right */}
      <section id="how" style={{ maxWidth: 1080, margin: '0 auto', padding: '56px 26px 60px' }}>
        <h2 style={{ ...SERIF, fontWeight: 600, fontSize: 'clamp(28px, 3.4vw, 38px)', color: DEEP, margin: '0 0 26px' }}>How it works</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '44px 70px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 380px', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 30 }}>
            {[
              { n: '1', t: 'Tell Buddy about the dog', d: 'Breed, coat condition, the style the client asked for. Twenty seconds of taps.' },
              { n: '2', t: 'Get the plan for that dog', d: 'A step-by-step plan in the school’s method: order, tools, blade lengths, what good looks like, and the one thing to watch on each step.' },
              { n: '3', t: 'Ask as you go', d: 'Every step has its own chat. Send a photo and Buddy tells you what to fix, located on the dog. Voice input works with slippery hands.' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ ...SERIF, fontWeight: 400, fontSize: 46, lineHeight: 1, color: GOLD, flex: 'none', width: 40 }}>{s.n}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, margin: '0 0 6px', color: DEEP }}>{s.t}</div>
                  <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.6, color: MUT }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 'none', margin: '0 auto' }}>
            <ChatDemo />
          </div>
        </div>
      </section>

      {/* FAQ: collapsible accordion on its own tint band */}
      <section id="faq" style={{ background: TINT, padding: '64px 26px 56px', ['--gbfInk' as never]: DEEP, ['--gbfMut' as never]: MUT, ['--gbfAccent' as never]: CLAY } as React.CSSProperties}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2 style={{ ...SERIF, fontWeight: 600, fontSize: 'clamp(28px, 3.4vw, 38px)', color: GOLD, margin: '0 0 26px' }}>Let&apos;s answer a few questions:</h2>
          {FAQS.map((f, i) => (
            <details key={f.q} className="gbFaq" open={i === 0}>
              <summary>
                <span>{f.q}</span>
                <span className="gbFaqIcon">
                  <svg className="gbFaqPlus" width="14" height="14" viewBox="0 0 24 24" aria-hidden><path d="M12 5v14M5 12h14" stroke={INK} strokeWidth="3" strokeLinecap="round" /></svg>
                  <svg className="gbFaqMinus" width="14" height="14" viewBox="0 0 24 24" aria-hidden><path d="M5 12h14" stroke={INK} strokeWidth="3" strokeLinecap="round" /></svg>
                </span>
              </summary>
              <p className="gbFaqA">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* pricing: cream, flat and honest, sleeping doodle keeping it calm */}
      <section id="pricing" style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 26px 64px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px 60px' }}>
        <div style={{ flex: '1 1 380px', maxWidth: 640 }}>
          <h2 style={{ ...SERIF, fontWeight: 600, fontSize: 'clamp(28px, 3.4vw, 38px)', color: DEEP, margin: '0 0 14px' }}>
            Free while it&apos;s in pilot.
          </h2>
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.65, color: MUT, margin: 0 }}>
            The whole thing, no signup. When paid plans arrive they&apos;ll be around
            $19 a month for individuals, and early users will get a founding rate.
            This is an early product: some answers will miss, and when they do you
            can tell the person who built it directly from inside the app.
          </p>
          <div style={{ marginTop: 26 }}>
            <Link href="/" style={{ display: 'inline-block', background: CLAY, color: INK, borderRadius: 999, padding: '14px 28px', fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: `0 3px 0 ${DEEP}` }}>
              Open Grooming Buddy
            </Link>
          </div>
        </div>
        <div style={{ flex: '1 1 240px', display: 'flex', justifyContent: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/sketch-sleeping-doodle.png" alt="Hand-drawn sketch of a doodle curled up asleep" style={{ width: 'min(280px, 80%)', height: 'auto', display: 'block' }} />
        </div>
      </section>

      {/* schools: tint band, editorial, grad-cap doodle */}
      <section id="schools" style={{ background: TINT, padding: '64px 26px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px 60px' }}>
          <div style={{ flex: '1 1 420px', maxWidth: 700 }}>
            <h2 style={{ ...SERIF, fontWeight: 600, fontSize: 'clamp(26px, 3.2vw, 34px)', color: DEEP, margin: '0 0 12px' }}>
              For grooming schools: your curriculum, your method, your brand
            </h2>
            <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.65, color: MUT, margin: '0 0 20px' }}>
              Your students already ask AI questions mid-groom, and today it answers
              with no method at all. Buddy lets your school own that moment: an
              instance branded to your school, grounded in your curriculum and video
              library, answering in your voice, with your safety rules. Your
              materials stay yours.
            </p>
            <a href="mailto:andrew+julian@get-tempo.com?subject=Grooming%20Buddy%20for%20our%20school" style={{ display: 'inline-block', background: DEEP, color: LIGHT, borderRadius: 999, padding: '13px 26px', fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
              Talk to us about a pilot
            </a>
          </div>
          <div style={{ flex: '1 1 220px', display: 'flex', justifyContent: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/sketch-grad-doodle.png" alt="Hand-drawn sketch of a doodle wearing a graduation cap" style={{ width: 'min(260px, 78%)', height: 'auto', display: 'block' }} />
          </div>
        </div>
      </section>

      <footer style={{ padding: '26px 22px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: MUT }}>
        Grooming Buddy · early access · <Link href="/diy" style={{ color: MUT }}>for home groomers</Link> · <a href="mailto:andrew+julian@get-tempo.com" style={{ color: MUT }}>contact</a>
      </footer>
    </main>
  );
}
