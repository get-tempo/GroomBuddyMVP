import type { Metadata } from 'next';
import Link from 'next/link';
import { ICONS } from '../marketing-ui';
import { SERIF, CREAM, INK, CLAY, DEEP, LIGHT, TINT, MUT, GOLD, Nav, ChatPill, ChatDemo } from '../editorial';
import AnalyticsInit from '../analytics-init';

// Landing page for DIY / home groomers, on the shared editorial design system
// (app/editorial.tsx). Pricing framing follows diy-pricing-plan.md: anchor to
// the salon visit, one-time hero SKU. No em dashes, no hype, no fabricated
// numbers or testimonials.

export const metadata: Metadata = {
  title: 'Groom Your Own Dog with a Coach in Your Pocket — Grooming Buddy',
  description:
    'A step-by-step plan for your exact dog, answers while you work, and photo feedback when something looks off. Built with a licensed grooming school. Free while in pilot.',
};

export default function Diy() {
  return (
    <main style={{ background: CREAM, color: INK, minHeight: '100dvh', overflowX: 'hidden' }}>
      <AnalyticsInit />

      <Nav links={[
        { href: '#how', label: 'How it works' },
        { href: '#safety', label: 'Safety' },
        { href: '#pricing', label: 'Pricing' },
        { href: '/welcome', label: 'For pros' },
      ]} />

      {/* hero: compact deep block, chat pill on the seam */}
      <header style={{ position: 'relative' }}>
        <div style={{ background: DEEP, padding: '64px 26px 96px' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            <h1 style={{ ...SERIF, fontWeight: 400, fontSize: 'clamp(40px, 5.4vw, 64px)', lineHeight: 1.08, color: LIGHT, margin: 0, maxWidth: 680 }}>
              Groom your own dog. Stop guessing.
            </h1>
            <p style={{ color: LIGHT, opacity: 0.75, fontSize: 17, fontWeight: 600, lineHeight: 1.6, margin: '18px 0 0', maxWidth: 540 }}>
              Buddy builds a step-by-step plan for your exact dog, answers your
              questions while you work, and looks at photos when something seems
              off. It coaches the way a grooming instructor does, because it was
              built with one.
            </p>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: -34, display: 'flex', justifyContent: 'center', padding: '0 22px' }}>
          <ChatPill />
        </div>
      </header>

      {/* promise band: pale butter, the money moment + the golden */}
      <section style={{ background: LIGHT, color: DEEP, padding: '84px 26px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '10px 50px', justifyContent: 'center' }}>
          <div style={{ flex: '1 1 300px', maxWidth: 420, display: 'flex', justifyContent: 'center', alignSelf: 'flex-end' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/sketch-golden-pawprints.png" alt="Hand-drawn sketch of a golden retriever glancing back, leaving paw prints" style={{ width: 'min(470px, 98%)', height: 'auto', display: 'block' }} />
          </div>
          <div style={{ flex: '1 1 380px', maxWidth: 540, paddingBottom: 64 }}>
            <h2 style={{ ...SERIF, fontWeight: 600, fontSize: 'clamp(24px, 3vw, 32px)', lineHeight: 1.25, margin: '0 0 12px' }}>
              The salon bill keeps coming.
            </h2>
            <p style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.6, margin: 0, opacity: 0.85 }}>
              Salon grooms commonly run $60 to $120 a visit, and a doodle needs
              one every 4 to 8 weeks. Buddy helps you do it yourself: a plan for
              your exact dog, one step at a time, with a coach to ask the moment
              you&apos;re unsure.
            </p>
            <div style={{ marginTop: 22 }}>
              <Link href="/" style={{ display: 'inline-block', background: CLAY, color: INK, borderRadius: 999, padding: '13px 26px', fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: `0 3px 0 ${DEEP}` }}>
                Try Buddy free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* why trust it: four centered icon columns */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '88px 26px 0' }}>
        <h2 style={{ ...SERIF, fontWeight: 600, fontSize: 'clamp(26px, 3.2vw, 34px)', color: DEEP, margin: 0, maxWidth: 720 }}>
          A real grooming education, in your pocket.
        </h2>
      </section>
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '44px 26px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '48px 48px' }}>
        {[
          { i: ICONS.book, t: 'A real school behind it', d: 'Answers come from a licensed grooming school’s curriculum, never generic internet advice.' },
          { i: ICONS.paw, t: 'Knows your dog', d: 'A doodle’s matting and a Shih Tzu’s coat get different plans, tools, and answers.' },
          { i: ICONS.shield, t: 'Safety first, always', d: 'Brush before blades, tiny tips on nails, and a hard stop the moment something is beyond a home groom.' },
          { i: ICONS.person, t: 'Honest about its limits', d: 'Tight matting? See a pro. Wounds or lumps? See a vet. Some grooms belong at a salon, and Buddy will say so.' },
        ].map(a => (
          <div key={a.t} style={{ textAlign: 'center' }}>
            <span aria-hidden style={{ display: 'block', width: 54, height: 54, color: GOLD, margin: '0 auto 16px' }}>{a.i}</span>
            <div style={{ fontWeight: 800, fontSize: 16.5, color: DEEP, marginBottom: 6 }}>{a.t}</div>
            <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.6, color: MUT }}>{a.d}</div>
          </div>
        ))}
      </section>

      {/* how it works: steps left, app demo right */}
      <section id="how" style={{ maxWidth: 1080, margin: '0 auto', padding: '56px 26px 60px' }}>
        <h2 style={{ ...SERIF, fontWeight: 600, fontSize: 'clamp(28px, 3.4vw, 38px)', color: DEEP, margin: '0 0 26px' }}>How it works</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '44px 70px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 380px', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 30 }}>
            {[
              { n: '1', t: 'Tell Buddy about your dog', d: 'Breed or mix, how matted the coat is, and the look you want. Twenty seconds of taps.' },
              { n: '2', t: 'Get your dog’s plan', d: 'A full plan in the right order: nails and prep first, bath, brush-out, then the haircut, with the tools and the one thing to watch at each step.' },
              { n: '3', t: 'Ask whenever you’re unsure', d: 'Every step has a chat. Send a photo mid-groom and Buddy tells you what to fix and whether you have room to keep going.' },
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

      {/* safety: tint band, copy + hard-rules checklist */}
      <section id="safety" style={{ background: TINT, padding: '64px 26px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '30px 60px' }}>
          <div style={{ flex: '1 1 380px', maxWidth: 620 }}>
            <h2 style={{ ...SERIF, fontWeight: 600, fontSize: 'clamp(26px, 3.2vw, 34px)', color: DEEP, margin: '0 0 12px' }}>
              Your dog&apos;s safety outranks the haircut
            </h2>
            <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.65, color: MUT, margin: 0 }}>
              Buddy keeps a licensed school&apos;s rules: brush fully before any
              blade, tiny tips on nails, and a hard stop the moment something is
              beyond a home groom. Some grooms belong at a salon, and Buddy will
              tell you when yours is one of them.
            </p>
          </div>
          <div style={{ flex: '1 1 300px', maxWidth: 380, background: '#fff', border: `2px solid ${DEEP}`, borderRadius: 16, padding: '20px 22px', boxShadow: `0 3px 0 ${DEEP}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span aria-hidden style={{ flex: 'none', width: 30, height: 30, color: GOLD }}>{ICONS.shield}</span>
              <span style={{ ...SERIF, fontWeight: 600, fontSize: 19, color: DEEP }}>Buddy&apos;s hard rules</span>
            </div>
            {[
              'Tight matting? See a pro.',
              'Wounds and lumps? See a vet.',
              'Stressed dog? Stop and settle.',
              'Never guesses at medical questions.',
            ].map(rule => (
              <div key={rule} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '2px dashed var(--dashed-border)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ flex: 'none' }} aria-hidden><circle cx="12" cy="12" r="10" fill={LIGHT} stroke={DEEP} strokeWidth="2" /><path d="M8 12.5l2.7 2.7L16.5 9" fill="none" stroke={DEEP} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: INK }}>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* pricing: cream, honest, sleeper */}
      <section id="pricing" style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 26px 64px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px 60px' }}>
        <div style={{ flex: '1 1 380px', maxWidth: 640 }}>
          <h2 style={{ ...SERIF, fontWeight: 600, fontSize: 'clamp(28px, 3.4vw, 38px)', color: DEEP, margin: '0 0 14px' }}>
            Free while it&apos;s in pilot.
          </h2>
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.65, color: MUT, margin: 0 }}>
            The whole thing, no signup. When paid plans arrive, the full custom
            plan for your dog will be a one-time purchase around $39, less than a
            single salon visit, and it stays yours. Early users will get a
            founding rate. This is an early product built by a small team; when
            an answer misses, you can tell us directly from inside the app.
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

      <footer style={{ padding: '26px 22px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: MUT }}>
        Grooming Buddy · early access · <Link href="/welcome" style={{ color: MUT }}>for students and pros</Link> · <a href="mailto:andrew+julian@get-tempo.com" style={{ color: MUT }}>contact</a>
      </footer>
    </main>
  );
}
