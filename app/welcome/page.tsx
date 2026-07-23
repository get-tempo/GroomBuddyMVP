import type { Metadata } from 'next';
import Link from 'next/link';
import { ICONS } from '../marketing-ui';
import { SERIF, FFD, CREAM, INK, CLAY, DEEP, LIGHT, TINT, MUT, GOLD, Nav, ChatPill, ChatDemo } from '../editorial';
import AnalyticsInit from '../analytics-init';

// Marketing landing page for students and pros. Editorial design system lives
// in app/editorial.tsx (shared with /diy). Copy rule: everything here is for
// the END USER; how-we-built-it details stay out. No em dashes, no hype, no
// fabricated numbers or testimonials.

export const metadata: Metadata = {
  title: 'Grooming Buddy — an AI coach for grooming students and new groomers',
  description:
    'Buddy builds a step-by-step plan for the exact dog on your table, answers questions mid-groom, and gives straight feedback on your work. Free while in pilot.',
};

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

      <Nav links={[
        { href: '#how', label: 'How it works' },
        { href: '#faq', label: 'FAQ' },
        { href: '#pricing', label: 'Pricing' },
        { href: '#schools', label: 'For schools' },
      ]} />

      {/* hero: compact deep block so the next band peeks above the fold */}
      <header style={{ position: 'relative' }}>
        <div style={{ background: DEEP, padding: '64px 26px 96px' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '28px 60px', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 380px', maxWidth: 640 }}>
              <h1 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 'clamp(36px, 4.8vw, 56px)', lineHeight: 1.1, color: LIGHT, margin: 0 }}>
                A grooming coach in your pocket, mid-groom.
              </h1>
              <p style={{ color: LIGHT, opacity: 0.75, fontSize: 17, fontWeight: 600, lineHeight: 1.6, margin: '18px 0 0', maxWidth: 540 }}>
                Buddy plans the groom for the exact dog on your table, answers while
                you work, and tells you straight what to fix.
              </p>
            </div>
            <div style={{ flex: 'none', width: 'clamp(150px, 18vw, 220px)', aspectRatio: '1', borderRadius: '50%', background: LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/logo-buddy.png" alt="" style={{ width: '68%', height: 'auto', display: 'block' }} />
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: -34, display: 'flex', justifyContent: 'center', padding: '0 22px' }}>
          <ChatPill prompts={[
            'How do I blend the neck into the chest?',
            'What blade for a matted doodle?',
            'How do I scissor a teddy head?',
            'How short can I go on a double coat?',
          ]} />
        </div>
      </header>

      {/* promise band: pale butter, the golden roams free */}
      <section style={{ background: LIGHT, color: DEEP, padding: '84px 26px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '10px 50px', justifyContent: 'center' }}>
          <div style={{ flex: '1 1 300px', maxWidth: 420, display: 'flex', justifyContent: 'center', alignSelf: 'flex-end' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/sketch-golden-pawprints.png" alt="Hand-drawn sketch of a golden retriever glancing back, leaving paw prints" style={{ width: 'min(470px, 98%)', height: 'auto', display: 'block' }} />
          </div>
          <div style={{ flex: '1 1 380px', maxWidth: 540, paddingBottom: 64 }}>
            <h2 style={{ ...SERIF, fontSize: 'clamp(24px, 3vw, 32px)', lineHeight: 1.25, margin: '0 0 12px' }}>
              New breed on the table? Buddy already knows it.
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

      {/* who is Buddy for */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 26px 8px', display: 'flex', flexWrap: 'wrap', gap: '28px 70px', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 300px', maxWidth: 420 }}>
          <h2 style={{ ...SERIF, fontSize: 'clamp(30px, 3.8vw, 42px)', color: GOLD, margin: '0 0 18px' }}>Who is Buddy for?</h2>
          <ul style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 8, fontWeight: 700, fontSize: 16, color: INK }}>
            <li>Grooming students</li>
            <li>New groomers, first two years</li>
            <li>Mobile groomers working solo</li>
            <li>Working groomers, any year</li>
            <li>Grooming schools</li>
          </ul>
        </div>
        <div style={{ flex: '1 1 380px', maxWidth: 560, paddingTop: 14 }}>
          <p style={{ fontSize: 16.5, fontWeight: 600, lineHeight: 1.65, color: MUT, margin: 0 }}>
            The hardest part of grooming is the moment nobody is standing next to
            you. Buddy is for everyone in that stretch: students between
            check-ins, new groomers building speed, mobile groomers working solo.
            Or anyone with a question, because nobody remembers every breed.
          </p>
          <p style={{ fontWeight: 800, fontSize: 17, color: INK, margin: '16px 0 0' }}>
            Grooming Buddy is made for the grooming table.
          </p>
        </div>
      </section>

      {/* what Buddy is: heading + four centered icon columns */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '88px 26px 0' }}>
        <h2 style={{ ...SERIF, fontSize: 'clamp(26px, 3.2vw, 34px)', color: DEEP, margin: 0, maxWidth: 720 }}>
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
          <div key={a.t} style={{ textAlign: 'center' }}>
            <span aria-hidden style={{ display: 'block', width: 54, height: 54, color: GOLD, margin: '0 auto 16px' }}>{a.i}</span>
            <div style={{ fontWeight: 800, fontSize: 16.5, color: DEEP, marginBottom: 6 }}>{a.t}</div>
            <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.6, color: MUT }}>{a.d}</div>
          </div>
        ))}
      </section>

      {/* how it works: steps left, the animated app demo right, inset panel */}
      <section id="how" style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 16px 60px' }}>
        <div style={{ background: LIGHT, borderRadius: 44, padding: '52px clamp(24px, 5vw, 64px) 56px' }}>
        <h2 style={{ ...SERIF, fontSize: 'clamp(28px, 3.4vw, 38px)', color: DEEP, margin: '0 0 26px' }}>How it works</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '44px 70px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 380px', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 30 }}>
            {[
              { n: '1', t: 'Tell Buddy about the dog', d: 'Breed, coat condition, the style the client asked for. Twenty seconds of taps.' },
              { n: '2', t: 'Get the plan for that dog', d: 'A step-by-step plan in the school’s method: order, tools, blade lengths, what good looks like, and the one thing to watch on each step.' },
              { n: '3', t: 'Ask as you go', d: 'Every step has its own chat. Send a photo and Buddy tells you what to fix, located on the dog. Voice input works with slippery hands.' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ ...SERIF, fontSize: 46, lineHeight: 1, color: GOLD, flex: 'none', width: 40 }}>{s.n}</div>
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
        </div>
      </section>

      {/* FAQ: collapsible accordion on its own tint band */}
      <section id="faq" style={{ background: TINT, padding: '64px 26px 56px', ['--gbfInk' as never]: DEEP, ['--gbfMut' as never]: MUT, ['--gbfAccent' as never]: CLAY } as React.CSSProperties}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2 style={{ ...SERIF, fontSize: 'clamp(28px, 3.4vw, 38px)', color: GOLD, margin: '0 0 26px' }}>Let&apos;s answer a few questions:</h2>
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
          <h2 style={{ ...SERIF, fontSize: 'clamp(28px, 3.4vw, 38px)', color: DEEP, margin: '0 0 14px' }}>
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
            <h2 style={{ ...SERIF, fontSize: 'clamp(26px, 3.2vw, 34px)', color: DEEP, margin: '0 0 12px' }}>
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
