import type { Metadata } from 'next';
import Link from 'next/link';
import { Fraunces } from 'next/font/google';
import { ICONS } from '../marketing-ui';
import AnalyticsInit from '../analytics-init';

// Marketing landing page, "warm clay" editorial direction (askperi.ai-inspired
// structure: tonal color blocks, serif display, sketchy line pets, chat pill
// straddling the hero seam). Palette is deliberately 4 values + white; the
// tonal rule everywhere is deep-shade text on bright-shade blocks and
// light-shade text on deep blocks. Copy rules unchanged: no em dashes, no
// hype, no fabricated numbers or testimonials.

const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '600'] });
const SERIF = fraunces.style.fontFamily;

export const metadata: Metadata = {
  title: 'Grooming Buddy — an AI coach for grooming students and new groomers',
  description:
    'Buddy builds a step-by-step plan for the exact dog on your table, answers questions mid-groom, and gives straight feedback on your work. Free while in pilot.',
};

// palette
const CREAM = '#faf5ec';
const INK = '#2b211a';
const CLAY = '#c9704a';       // bright block
const DEEP = '#572a18';       // deep block / text on clay
const LIGHT = '#f2cdb2';      // light text on deep
const TINT = '#f5e6d9';       // subtle section tint
const MUT = '#6f5b4d';        // muted body on cream

const sketch = { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const sketchThin = { ...sketch, strokeWidth: 2 } as const;

// Sketchy hand-drawn sitting dog (hero). Loose, wobbly lines on purpose.
function SketchDog({ size = 300 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 220 220" aria-hidden>
      {/* floppy ears, filled like the marker pressed harder */}
      <path d="M64 46 C58 30 66 22 76 26 C84 29 86 40 82 50 C76 47 69 46 64 46 Z" fill="currentColor" />
      <path d="M128 44 C136 28 148 26 152 36 C155 45 146 54 138 56 C135 51 132 47 128 44 Z" fill="currentColor" />
      {/* head */}
      <path {...sketch} d="M66 48 C60 60 62 74 72 82 C84 91 112 92 126 84 C138 77 140 62 132 50 C122 38 104 34 88 38 C79 40 70 43 66 48" />
      {/* scruffy beard scribble */}
      <path {...sketchThin} d="M84 88 C86 94 90 97 94 99 M100 92 C101 97 104 101 108 102 M114 90 C116 95 119 98 122 99" />
      {/* eyes + nose + mouth */}
      <circle cx="90" cy="62" r="3.4" fill="currentColor" />
      <circle cx="114" cy="61" r="3.4" fill="currentColor" />
      <path d="M99 72 C101 69 107 69 109 72 C107 76 101 76 99 72 Z" fill="currentColor" />
      <path {...sketchThin} d="M104 76 C104 80 101 83 97 83 M104 80 C106 83 110 84 112 82" />
      {/* body: one big lazy arc down to the haunch */}
      <path {...sketch} d="M70 84 C58 104 52 132 56 158 C58 172 64 180 74 184" />
      <path {...sketch} d="M130 86 C144 100 154 122 154 144 C154 164 146 178 132 184" />
      {/* haunch + hatching */}
      <path {...sketch} d="M132 184 C116 190 92 190 74 184" />
      <path {...sketchThin} d="M138 140 C133 148 132 156 134 164 M146 136 C142 146 141 156 143 166" />
      {/* front legs */}
      <path {...sketch} d="M88 118 C87 138 87 158 88 178 M108 120 C108 140 108 158 108 178" />
      <path {...sketchThin} d="M82 182 C86 185 92 185 95 182 M103 182 C107 185 112 185 115 182" />
      {/* tail: happy curl + motion marks */}
      <path {...sketch} d="M154 150 C168 146 178 136 178 122 C178 114 172 110 166 114" />
      <path {...sketchThin} d="M182 106 C185 103 187 99 188 95 M186 116 C190 114 193 111 195 107" />
      {/* stray collar */}
      <path {...sketchThin} d="M76 92 C90 100 112 100 126 92" />
    </svg>
  );
}

// Small sketch trio for the clay band: curled-up doodle + scissors + comb.
function SketchTrio({ width = 340 }: { width?: number }) {
  return (
    <svg width={width} height={width * 0.5} viewBox="0 0 340 170" aria-hidden>
      {/* curled sleeping doodle */}
      <path {...sketch} d="M40 120 C34 96 50 74 78 70 C110 65 138 82 140 106 C142 126 126 140 104 141 C82 142 66 134 60 122" />
      <path {...sketch} d="M60 122 C66 110 80 104 92 108 C102 111 106 122 100 130 C94 137 80 137 74 130" />
      <path {...sketchThin} d="M50 96 C46 104 45 112 47 119 M120 84 C126 90 130 98 131 106" />
      <circle cx="86" cy="118" r="2.6" fill="currentColor" />
      <path {...sketchThin} d="M92 124 C94 127 98 127 100 125" />
      {/* zzz */}
      <path {...sketchThin} d="M128 56 L140 56 L128 68 L140 68 M148 40 L158 40 L148 50 L158 50" />
      {/* scissors */}
      <circle {...sketchThin} cx="212" cy="128" r="10" />
      <circle {...sketchThin} cx="212" cy="98" r="10" />
      <path {...sketch} d="M220 122 L268 96 M220 104 L268 130" />
      {/* comb */}
      <path {...sketch} d="M292 70 L322 70 L322 84 L292 84 Z" />
      <path {...sketchThin} d="M296 84 L296 104 M303 84 L303 108 M310 84 L310 104 M317 84 L317 108" />
      {/* stray fluff */}
      <path {...sketchThin} d="M180 60 C184 56 190 55 194 58 M170 74 C173 70 178 69 181 71" />
    </svg>
  );
}

// The hero chat pill: the actual product, straddling the color seam.
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
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path d="M12 19V6M6 12l6-6 6 6" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
      </span>
    </Link>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} style={{ color: DEEP, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>{children}</a>;
}

export default function Welcome() {
  return (
    <main style={{ background: CREAM, color: INK, minHeight: '100dvh', overflowX: 'hidden' }}>
      <AnalyticsInit />

      {/* nav: bright clay bar, deep text (tonal pair #1) */}
      <nav style={{ background: CLAY, padding: '16px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 24, color: DEEP, letterSpacing: 0.2 }}>grooming buddy</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          <NavLink href="#how">How it works</NavLink>
          <NavLink href="#method">Why Buddy</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#schools">For schools</NavLink>
          <Link href="/" style={{ background: DEEP, color: LIGHT, borderRadius: 999, padding: '10px 20px', fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>Open Buddy</Link>
        </div>
      </nav>

      {/* hero: split blocks, chat pill straddling the bottom seam */}
      <header style={{ position: 'relative' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* left: sketch block on tint */}
          <div style={{ flex: '1 1 380px', background: TINT, color: DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 30px 96px' }}>
            <SketchDog size={300} />
          </div>
          {/* right: deep block, light serif (tonal pair #2) */}
          <div style={{ flex: '1 1 420px', background: DEEP, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 8vw 110px 5vw' }}>
            <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(38px, 5.2vw, 62px)', lineHeight: 1.08, color: LIGHT, margin: 0 }}>
              A coach in your pocket, mid-groom.
            </h1>
            <p style={{ color: LIGHT, opacity: 0.75, fontSize: 17, fontWeight: 600, lineHeight: 1.6, margin: '18px 0 0', maxWidth: 460 }}>
              Buddy plans the groom for the exact dog on your table, answers while
              you work, and tells you straight what to fix.
            </p>
          </div>
        </div>
        {/* the pill on the seam */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: -34, display: 'flex', justifyContent: 'center', padding: '0 22px' }}>
          <ChatPill />
        </div>
      </header>

      {/* clay band: sketchy pets + promise (tonal pair #1) */}
      <section style={{ background: CLAY, color: DEEP, padding: '92px 26px 64px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '30px 60px', justifyContent: 'center' }}>
          <div style={{ flex: '1 1 320px', display: 'flex', justifyContent: 'center' }}><SketchTrio /></div>
          <div style={{ flex: '1 1 380px', maxWidth: 520 }}>
            <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(24px, 3vw, 32px)', lineHeight: 1.25, margin: '0 0 12px' }}>
              Helping grooming students and new groomers work with confidence.
            </h2>
            <p style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.6, margin: 0, opacity: 0.85 }}>
              Your instructor can&apos;t be at every table, and a 40-minute video
              doesn&apos;t help with wet hands. Buddy is the answer in the moment,
              grounded in a real school&apos;s curriculum.
            </p>
            <div style={{ marginTop: 22 }}>
              <Link href="/" style={{ display: 'inline-block', background: '#fff', color: DEEP, borderRadius: 999, padding: '13px 26px', fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: `0 3px 0 ${DEEP}` }}>
                Try Buddy free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* who is Buddy for: serif question + plain list left, editorial right */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 26px 8px', display: 'flex', flexWrap: 'wrap', gap: '28px 70px', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 300px', maxWidth: 420 }}>
          <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(30px, 3.8vw, 42px)', color: CLAY, margin: '0 0 18px' }}>Who is Buddy for?</h2>
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

      {/* audience columns: line icons over whitespace, Peri-style */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '56px 26px 8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '34px 40px' }}>
        {[
          { i: ICONS.book, t: 'Grooming students', d: 'Between instructor check-ins, Buddy answers the question you were about to save for later, while the dog is still on the table.' },
          { i: ICONS.paw, t: 'New groomers', d: 'Your first two years are full of dogs you have never done. Get a plan for each one and a straight answer when something looks off.' },
          { i: ICONS.target, t: 'Mobile groomers', d: 'No senior groomer in the van. Buddy rides along: plans, technique cues, and photo checks between stops.' },
          { i: ICONS.shield, t: 'Grooming schools', d: 'A coach in your students’ pocket that teaches your method, grounded in your curriculum, under your brand.' },
        ].map(a => (
          <div key={a.t}>
            <span aria-hidden style={{ display: 'block', width: 34, height: 34, color: CLAY, marginBottom: 10 }}>{a.i}</span>
            <div style={{ fontWeight: 800, fontSize: 16.5, color: DEEP, marginBottom: 6 }}>{a.t}</div>
            <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.6, color: MUT }}>{a.d}</div>
          </div>
        ))}
      </section>

      {/* how it works: cream, editorial, no boxes */}
      <section id="how" style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 26px 60px' }}>
        <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(28px, 3.4vw, 38px)', color: DEEP, margin: '0 0 40px' }}>How it works</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '36px 48px' }}>
          {[
            { n: '1', t: 'Tell Buddy about the dog', d: 'Breed, coat condition, the style the client asked for. Twenty seconds of taps, with an Other option for everything.' },
            { n: '2', t: 'Get the plan for that dog', d: 'A 7 to 9 step plan in the school’s method: order, tools, blade lengths, what good looks like, and the one thing to watch on each step.' },
            { n: '3', t: 'Ask as you go', d: 'Every step has its own chat. Send a photo and Buddy tells you what to fix first, located on the dog, no fluff. Voice input works with slippery hands.' },
          ].map(s => (
            <div key={s.n} style={{ flex: '1 1 260px', minWidth: 250 }}>
              <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 54, lineHeight: 1, color: CLAY }}>{s.n}</div>
              <div style={{ fontWeight: 800, fontSize: 18, margin: '10px 0 8px', color: DEEP }}>{s.t}</div>
              <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.6, color: MUT }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* deep band: the method, light text, simple two-column list */}
      <section id="method" style={{ background: DEEP, color: LIGHT, padding: '64px 26px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(28px, 3.4vw, 38px)', margin: '0 0 10px' }}>A coach with a method, and honest</h2>
          <p style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.6, opacity: 0.75, maxWidth: 680, margin: '0 0 34px' }}>
            Built alongside a state-licensed professional grooming school, grounded
            in real curriculum, and piloted by that school&apos;s students right now.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '26px 48px' }}>
            {[
              { i: ICONS.book, t: 'Grounded in real curriculum', d: 'Answers come from a licensed school’s materials, in an instructor’s voice.' },
              { i: ICONS.paw, t: 'Knows breeds and coats', d: 'A doodle’s matting and a Schnauzer’s skirt get different answers and blade lengths.' },
              { i: ICONS.target, t: 'Leads with what to fix', d: 'Photo feedback starts with the problems, located on the dog.' },
              { i: ICONS.sliders, t: 'Style choices are not errors', d: 'A teddy head on a short body is a look. Buddy knows a choice from a mistake.' },
              { i: ICONS.shield, t: 'Safety first, always', d: 'Brush before blades, tiny tips on nails, hot-blade checks, baked into every plan.' },
              { i: ICONS.person, t: 'Knows when you need a human', d: 'Tight matting, a stressed dog, anything medical: stop, get a person. It never replaces an instructor.' },
            ].map(f => (
              <div key={f.t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', color: LIGHT }}>
                <span aria-hidden style={{ flex: 'none', width: 26, height: 26, marginTop: 2, color: CLAY }}>{f.i}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{f.t}</div>
                  <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.55, opacity: 0.75 }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ: compact, honest */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 26px 8px' }}>
        <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(28px, 3.4vw, 38px)', color: DEEP, margin: '0 0 28px' }}>Questions, answered straight</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '26px 48px' }}>
          {[
            { q: 'Is it really free?', a: 'Yes, everything, while we are in pilot. When paid plans arrive (around $19 a month), early users get a founding rate. No card, no signup today.' },
            { q: 'Does it replace my instructor?', a: 'No, and it will tell you so itself. Buddy coaches between instructors. Tight matting, a stressed dog, or anything medical gets one answer: stop and get a person.' },
            { q: 'Why not just use ChatGPT?', a: 'A general chatbot has no method. Buddy is grounded in a licensed grooming school’s curriculum, asks groomer questions (breed, coat condition, intended style), and answers the way an instructor teaches.' },
            { q: 'What do I need to install?', a: 'Nothing. It runs in your phone’s browser. Open the link, add it to your home screen if you want, and start a groom.' },
            { q: 'Can it see my work?', a: 'Send a photo mid-groom and Buddy tells you what to fix first, located on the dog. It judges execution against your intended style, and style choices are not treated as errors.' },
            { q: 'Who built this?', a: 'A tiny team working alongside a state-licensed professional grooming school, whose students are piloting it right now. When an answer misses, you can tell us from inside the app.' },
          ].map(f => (
            <div key={f.q}>
              <div style={{ fontWeight: 800, fontSize: 16.5, color: DEEP, marginBottom: 6 }}>{f.q}</div>
              <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.6, color: MUT }}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* pricing: cream, flat and honest */}
      <section id="pricing" style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 26px 64px' }}>
        <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(28px, 3.4vw, 38px)', color: DEEP, margin: '0 0 14px' }}>
          Free while it&apos;s in pilot.
        </h2>
        <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.65, color: MUT, maxWidth: 660, margin: 0 }}>
          The whole thing, no signup. When paid plans arrive they&apos;ll be around
          $19 a month for individuals, and early users will get a founding rate.
          This is an early product: some answers will miss, and when they do you
          can tell the person who built it directly from inside the app.
        </p>
        <div style={{ marginTop: 26 }}>
          <Link href="/" style={{ display: 'inline-block', background: CLAY, color: '#fff', borderRadius: 999, padding: '14px 28px', fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: `0 3px 0 ${DEEP}` }}>
            Open Grooming Buddy
          </Link>
        </div>
      </section>

      {/* schools: tint band, editorial */}
      <section id="schools" style={{ background: TINT, padding: '64px 26px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(26px, 3.2vw, 34px)', color: DEEP, margin: '0 0 12px' }}>
            For grooming schools: your curriculum, your method, your brand
          </h2>
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.65, color: MUT, maxWidth: 760, margin: '0 0 20px' }}>
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
      </section>

      <footer style={{ padding: '26px 22px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: MUT }}>
        Grooming Buddy · early access · <Link href="/diy" style={{ color: MUT }}>for home groomers</Link> · <a href="mailto:andrew+julian@get-tempo.com" style={{ color: MUT }}>contact</a>
      </footer>
    </main>
  );
}
