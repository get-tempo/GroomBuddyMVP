import type { Metadata } from 'next';
import Link from 'next/link';
import { ICONS } from '../marketing-ui';
import { SERIF, FFD, CREAM, INK, CLAY, DEEP, LIGHT, TINT, MUT, GOLD, Nav, ChatPill, EStepRow, LogoBone } from '../editorial';
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
          <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '28px 60px', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 380px', maxWidth: 640 }}>
              <div style={{ display: 'inline-block', background: CLAY, color: INK, borderRadius: 999, padding: '7px 15px', fontWeight: 800, fontSize: 13.5, marginBottom: 18 }}>
                Free for a limited time · No password, just your email
              </div>
              <h1 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 'clamp(36px, 4.8vw, 56px)', lineHeight: 1.1, color: LIGHT, margin: 0 }}>
                Groom your own dog, with a pro-level coach.
              </h1>
              <p style={{ color: LIGHT, opacity: 0.75, fontSize: 17, fontWeight: 600, lineHeight: 1.6, margin: '18px 0 0', maxWidth: 540 }}>
                Buddy builds a step-by-step plan for your exact dog, answers your
                questions while you work, and looks at photos when something seems
                off. It coaches the way a grooming instructor does, because it was
                built with one.
              </p>
            </div>
            <LogoBone />
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: -34, display: 'flex', justifyContent: 'center', padding: '0 22px' }}>
          <ChatPill prompts={[
            'Her nails are black, how much do I take off?',
            'How do I get mats out behind the ears?',
            'What order do I do everything in?',
            'How do I trim around the eyes safely?',
          ]} />
        </div>
      </header>

      {/* promise band: pale butter, the empty-wallet doodle + the money moment */}
      <section style={{ background: LIGHT, color: DEEP, padding: '72px 26px 56px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 50px', justifyContent: 'center' }}>
          <div style={{ flex: '1 1 300px', maxWidth: 400, display: 'flex', justifyContent: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/sketch-wallet-doodle.png" alt="Hand-drawn sketch of a worried doodle beside an empty wallet and scattered coins" style={{ width: 'min(340px, 88%)', height: 'auto', display: 'block' }} />
          </div>
          <div style={{ flex: '1 1 380px', maxWidth: 540 }}>
            <h2 style={{ ...SERIF, fontSize: 'clamp(24px, 3vw, 32px)', lineHeight: 1.25, margin: '0 0 12px' }}>
              Those salon visits add up.
            </h2>
            <p style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.6, margin: 0, opacity: 0.85 }}>
              Buddy helps you do it yourself: a plan for your exact dog, one step
              at a time, with a coach to ask the moment you&apos;re unsure. Built
              with a real grooming school.
            </p>
            <div style={{ marginTop: 22 }}>
              <Link href="/" style={{ display: 'inline-block', background: CLAY, color: INK, borderRadius: 999, padding: '13px 26px', fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: `0 3px 0 ${DEEP}` }}>
                Try Buddy free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* why you're here: bento, editorial-recolored */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 26px 8px' }}>
        <h2 style={{ ...SERIF, fontSize: 'clamp(28px, 3.4vw, 38px)', color: DEEP, margin: '0 0 24px', maxWidth: 760 }}>
          Grooming at home saves real money. Buddy makes it doable.
        </h2>
        <div className="gbBento">
          <div className="gbSpan4" style={{ background: CLAY, border: `2px solid ${DEEP}`, borderRadius: 18, padding: '22px 24px', boxShadow: `0 3px 0 ${DEEP}`, display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ ...SERIF, fontSize: 'clamp(34px, 4.5vw, 46px)', lineHeight: 1, whiteSpace: 'nowrap', color: DEEP }}>
                $60<span style={{ fontSize: '0.55em' }}> to </span>$120
              </div>
              <div style={{ flex: '1 1 240px', fontSize: 14.5, fontWeight: 600, lineHeight: 1.55, color: DEEP, opacity: 0.85 }}>
                is what a salon visit commonly runs, and a doodle needs one every
                4 to 8 weeks. Per dog, every year, that is serious money.
              </div>
            </div>
          </div>
          <div className="gbSpan2" style={{ background: '#fff', border: `2px solid ${DEEP}`, borderRadius: 18, padding: '20px 22px', boxShadow: `0 3px 0 ${DEEP}` }}>
            <span aria-hidden style={{ display: 'block', width: 36, height: 36, marginBottom: 8 }}>
              <svg viewBox="0 0 40 40" width="100%" height="100%"><rect x="4" y="8" width="32" height="24" rx="4" fill="none" stroke={DEEP} strokeWidth="2.4" /><path d="M17 14v12l10-6-10-6z" fill={DEEP} /></svg>
            </span>
            <div style={{ fontWeight: 800, fontSize: 16.5, color: DEEP, marginBottom: 6 }}>The videos online aren&apos;t made for your dog</div>
            <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.55, color: MUT }}>
              Your dog&apos;s coat, mats, and patience are not the ones in the
              tutorial. You need answers about the dog in front of you.
            </div>
          </div>
          <div className="gbSpan3" style={{ background: '#fff', border: `2px solid ${DEEP}`, borderRadius: 18, padding: '20px 22px', boxShadow: `0 3px 0 ${DEEP}` }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span aria-hidden style={{ flex: 'none', width: 30, height: 30, color: GOLD, marginTop: 2 }}>{ICONS.shield}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16.5, color: DEEP, marginBottom: 6 }}>One bad snip ruins your confidence</div>
                <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.55, color: MUT }}>
                  Nails, ears, and mats are exactly where owners get scared, and
                  where guessing actually can hurt your dog. That fear is reasonable.
                </div>
              </div>
            </div>
          </div>
          <div className="gbSpan3" style={{ background: LIGHT, border: `2px solid ${DEEP}`, borderRadius: 18, padding: '20px 22px', boxShadow: `0 3px 0 ${DEEP}`, display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span aria-hidden style={{ flex: 'none', width: 30, height: 30, color: DEEP, marginTop: 2 }}>{ICONS.paw}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16.5, color: DEEP, marginBottom: 6 }}>Buddy is with you every step of the way</div>
                <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.55, color: DEEP, opacity: 0.8 }}>
                  A plan for your exact dog, and a coach you can ask at any step
                  of the groom, the moment you&apos;re unsure. Built with a real
                  grooming school.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* why trust it: four centered icon columns */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 26px 0' }}>
        <h2 style={{ ...SERIF, fontSize: 'clamp(26px, 3.2vw, 34px)', color: DEEP, margin: 0, maxWidth: 720 }}>
          A real grooming education, in your pocket.
        </h2>
      </section>
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '44px 26px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '48px 48px' }}>
        {[
          { i: ICONS.book, t: 'A real school behind it', d: 'Answers come from a licensed grooming school’s curriculum, never generic internet advice.' },
          { i: ICONS.paw, t: 'Knows your dog', d: 'A doodle’s matting and a Shih Tzu’s coat get different plans, tools, and answers.' },
          { i: ICONS.shield, t: 'Safety first, always', d: 'Brush before blades, tiny tips on nails, and a hard stop the moment something is beyond a home groom.' },
          { i: ICONS.person, t: 'Honest about its limits', d: 'When Buddy isn’t sure, it’s built to say so and point you to a person, not guess. No made-up answers about your dog.' },
        ].map(a => (
          <div key={a.t} style={{ textAlign: 'center' }}>
            <span aria-hidden style={{ display: 'block', width: 54, height: 54, color: GOLD, margin: '0 auto 16px' }}>{a.i}</span>
            <div style={{ fontWeight: 800, fontSize: 16.5, color: DEEP, marginBottom: 6 }}>{a.t}</div>
            <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.6, color: MUT }}>{a.d}</div>
          </div>
        ))}
      </section>

      {/* how it works: the zigzag with doodle blobs, on an inset rounded panel */}
      <section id="how" style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 16px 60px' }}>
        <div style={{ background: LIGHT, borderRadius: 44, padding: '52px clamp(24px, 5vw, 64px) 56px' }}>
        <h2 style={{ ...SERIF, fontSize: 'clamp(28px, 3.4vw, 38px)', color: DEEP, margin: '0 0 34px' }}>How it works</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          <EStepRow n={1} title="Tell Buddy about your dog" doodle="paw" tint={CREAM}>
            Breed or mix, how matted the coat is, and the look you want. Twenty
            seconds of taps. Honest answers get honest plans.
          </EStepRow>
          <EStepRow n={2} title="Get your dog's plan" doodle="bone" tint={TINT} flip>
            A full plan in the right order (nails and prep first, bath,
            brush-out, then the haircut), with the tools and the one thing to
            watch at each step.
          </EStepRow>
          <EStepRow n={3} title="Ask whenever you're unsure" doodle="bubbles" tint={CREAM}>
            Every step has a chat. Send a photo mid-groom and Buddy tells you
            what to fix and whether you have room to keep going.
          </EStepRow>
        </div>
        </div>
      </section>

      {/* safety: tint band, copy + hard-rules checklist */}
      <section id="safety" style={{ background: TINT, padding: '64px 26px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '30px 60px' }}>
          <div style={{ flex: '1 1 380px', maxWidth: 620 }}>
            <h2 style={{ ...SERIF, fontSize: 'clamp(26px, 3.2vw, 34px)', color: DEEP, margin: '0 0 12px' }}>
              Your dog&apos;s safety outranks the haircut
            </h2>
            <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.65, color: MUT, margin: 0 }}>
              Buddy keeps a licensed school&apos;s rules: brush fully before any
              blade, tiny tips on nails, and a hard stop the moment something is
              beyond a home groom. Some grooms belong at a salon, and Buddy will
              tell you when yours is one of them. And when it doesn&apos;t know
              something, it&apos;s built to say so, not to make an answer up.
            </p>
          </div>
          <div style={{ flex: '1 1 300px', maxWidth: 380, background: '#fff', border: `2px solid ${DEEP}`, borderRadius: 16, padding: '20px 22px', boxShadow: `0 3px 0 ${DEEP}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span aria-hidden style={{ flex: 'none', width: 30, height: 30, color: GOLD }}>{ICONS.shield}</span>
              <span style={{ ...SERIF, fontSize: 19, color: DEEP }}>Buddy&apos;s hard rules</span>
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
          <h2 style={{ ...SERIF, fontSize: 'clamp(28px, 3.4vw, 38px)', color: DEEP, margin: '0 0 14px' }}>
            Free while it&apos;s in pilot.
          </h2>
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.65, color: MUT, margin: 0 }}>
            The whole thing, no password, just your email. When paid plans arrive, the full custom
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
