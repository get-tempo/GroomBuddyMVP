import type { Metadata } from 'next';
import { INK, BORDER, HARD, HARD2, FFD, CTA, Footer, PhoneFrame, Doodle, StepRow, BentoCell, Starburst, DOTS_BG, DOODLES, ICONS } from '../marketing-ui';
import AnalyticsInit from '../analytics-init';

// Landing page for DIY / home groomers (owners grooming their own dog).
// Copy rules: no em dashes, no hype, no fabricated numbers or testimonials.
// Pricing framing follows validator/grooming-buddy/diy-pricing-plan.md:
// anchor to the salon visit, one-time hero SKU, never mention API costs.

export const metadata: Metadata = {
  title: 'Groom Your Own Dog with a Coach in Your Pocket — Grooming Buddy',
  description:
    'A step-by-step plan for your exact dog, answers while you work, and photo feedback when something looks off. Built with a licensed grooming school. Free while in pilot.',
};

// The DIY fear that matters most: nails and the quick, on black nails.
function PhoneDemo() {
  return (
    <PhoneFrame>
      <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 13, color: 'var(--muted-1)' }}>Bella · Goldendoodle · step 1 of 7</div>
      <div style={{ background: '#fff', border: BORDER, borderRadius: 16, padding: '12px 14px', boxShadow: HARD2 }}>
        <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 16 }}>Nails first, before the bath</div>
        <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.5, marginTop: 6 }}>
          1. Hold the paw firm but relaxed, thumb on the pad.<br />
          2. Trim tiny tips, one nail at a time.<br />
          3. Stop at the first sign of a dark center.
        </div>
        <div style={{ marginTop: 8, background: 'var(--primary-soft)', border: `2px solid var(--ink)`, borderRadius: 10, padding: '7px 10px', fontSize: 12.5, fontWeight: 700 }}>
          Pro tip: trim after a walk on pavement. The nails are naturally worn and the dog is calmer.
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: '85%', background: 'var(--primary)', border: BORDER, borderRadius: 14, borderBottomRightRadius: 4, padding: '8px 11px', fontSize: 13, fontWeight: 700, boxShadow: HARD2 }}>
          Her nails are black. I can&apos;t see the quick. How much do I take off?
        </div>
      </div>
      <div style={{ maxWidth: '90%', background: '#fff', border: BORDER, borderRadius: 14, borderTopLeftRadius: 4, padding: '9px 12px', fontSize: 13, fontWeight: 600, lineHeight: 1.5, boxShadow: HARD2 }}>
        On black nails you go by the cut surface, not by sight. Take thin slivers off the tip. When the center of the cut face turns from dry white to a darker, softer dot, stop there. That dot means the quick is close. Send me a photo of one cut nail and I&apos;ll tell you if you have room.
      </div>
    </PhoneFrame>
  );
}

export default function Diy() {
  return (
    <main style={{ background: 'var(--cream)', color: INK, minHeight: '100dvh', overflowX: 'hidden' }}>
      <AnalyticsInit />
      {/* hero */}
      <section style={{ position: 'relative', ...DOTS_BG }}>
        <Doodle kind="bubbles" size={56} top={44} left="5%" rotate={-8} delay={0.5} />
        <Doodle kind="bone" size={52} bottom={60} left="9%" rotate={12} delay={1.4} />
        <Doodle kind="sparkle" size={34} top={64} right="7%" rotate={12} opacity={0.8} delay={0.9} />
        <Doodle kind="paw" size={42} bottom={80} right="4%" rotate={-14} opacity={0.25} delay={2} />
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '54px 22px 44px', display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ flex: '1 1 420px', maxWidth: 560 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/Smileydogfunny.jpg" alt="Buddy" style={{ width: 44, height: 44, borderRadius: '50%', border: BORDER, objectFit: 'cover' }} />
              <span style={{ fontFamily: FFD, fontWeight: 800, fontSize: 20 }}>Grooming Buddy</span>
            </div>
            <h1 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 'clamp(34px, 6vw, 52px)', lineHeight: 1.08, margin: '0 0 10px' }}>
              Groom your own dog.<br />
              <span style={{ background: 'var(--primary)', border: BORDER, borderRadius: 14, padding: '0 14px 4px', boxShadow: HARD2, display: 'inline-block', transform: 'rotate(-1.2deg)' }}>Stop guessing.</span>
            </h1>
            <span aria-hidden style={{ display: 'block', width: 150, height: 18, margin: '4px 0 14px' }}>{DOODLES.squiggle}</span>
            <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.6, color: 'var(--muted-1)', margin: '0 0 22px' }}>
              Buddy builds a step-by-step plan for your exact dog, answers your
              questions while you work, and looks at photos when something seems off.
              It coaches the way a grooming instructor does, because it was built with one.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <CTA href="/">Try it now, it&apos;s free</CTA>
            </div>
            <div style={{ marginTop: 14, fontSize: 13.5, fontWeight: 700, color: 'var(--muted-2)' }}>
              No signup. Works on your phone, next to the tub.
            </div>
          </div>
          <PhoneDemo />
        </div>
      </section>

      {/* the pain: bento with the money cell big */}
      <section style={{ background: 'var(--canvas)', borderTop: BORDER, borderBottom: BORDER, padding: '44px 22px', position: 'relative' }}>
        <Doodle kind="squiggle" size={70} top={22} right="8%" rotate={-6} opacity={0.4} />
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 30, margin: '0 0 22px' }}>Why you&apos;re here</h2>
          <div className="gbBento">
            <BentoCell span={4} tint="var(--primary-soft)" tilt={-0.5}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 'clamp(34px, 4.5vw, 46px)', lineHeight: 1, whiteSpace: 'nowrap' }}>
                  $60<span style={{ fontSize: '0.55em' }}> to </span>$120
                </div>
                <div style={{ flex: '1 1 240px', fontSize: 14.5, fontWeight: 600, lineHeight: 1.55, color: 'var(--muted-1)' }}>
                  is what a salon visit commonly runs, and a doodle needs one every 4 to
                  8 weeks. Per dog, every year, that is serious money.
                </div>
              </div>
            </BentoCell>
            <BentoCell span={2} tilt={0.8}>
              <span aria-hidden style={{ display: 'block', width: 40, height: 40, marginBottom: 8 }}>
                <svg viewBox="0 0 40 40" width="100%" height="100%"><rect x="4" y="8" width="32" height="24" rx="4" fill="none" stroke="var(--ink)" strokeWidth="2.4" /><path d="M17 14v12l10-6-10-6z" fill="var(--ink)" /></svg>
              </span>
              <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 17, marginBottom: 6 }}>The video is for someone else&apos;s dog</div>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.55, color: 'var(--muted-1)' }}>
                Your dog&apos;s coat, mats, and patience are not the ones in the
                tutorial. You need answers about the dog in front of you.
              </div>
            </BentoCell>
            <BentoCell span={3} tilt={-0.6}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ flex: 'none', width: 34, height: 34, padding: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '2px solid var(--ink)', borderRadius: 10, boxShadow: HARD2 }}>{ICONS.shield}</span>
                <div>
                  <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 17, marginBottom: 6 }}>One bad snip ruins your confidence</div>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.55, color: 'var(--muted-1)' }}>
                    Nails, ears, and mats are exactly where owners get scared, and where
                    guessing actually can hurt your dog. That fear is reasonable.
                  </div>
                </div>
              </div>
            </BentoCell>
            <BentoCell span={3} tint="var(--green-tint)" tilt={0.5}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span aria-hidden style={{ flex: 'none', width: 44, height: 44, transform: 'rotate(6deg)' }}>{DOODLES.paw}</span>
                <div>
                  <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 17, marginBottom: 6, color: 'var(--green-text)' }}>Buddy sits next to the tub</div>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.55, color: 'var(--green-text-2)' }}>
                    A plan for your exact dog, one step at a time, with a coach to ask
                    the moment you&apos;re unsure. Built with a real grooming school.
                  </div>
                </div>
              </div>
            </BentoCell>
          </div>
        </div>
      </section>

      {/* how it works: numbered zigzag */}
      <section style={{ maxWidth: 1060, margin: '0 auto', padding: '48px 22px', position: 'relative' }}>
        <Doodle kind="scissors" size={46} top={34} right="3%" rotate={-16} opacity={0.25} delay={1} />
        <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 30, margin: '0 0 30px' }}>How it works</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          <StepRow n={1} title="Tell Buddy about your dog" doodle="paw" tint="var(--primary-soft)">
            Breed or mix, how matted the coat is, and the look you want. Twenty
            seconds of taps. Honest answers get honest plans.
          </StepRow>
          <StepRow n={2} title="Get your dog&apos;s plan" doodle="bone" tint="var(--green-tint)" flip>
            A full plan in the right order (nails and prep first, bath, brush-out,
            then the haircut), with the tools and the one thing to watch at each step.
          </StepRow>
          <StepRow n={3} title="Ask whenever you&apos;re unsure" doodle="bubbles" tint="var(--neutral-fill)">
            Every step has a chat. Send a photo mid-groom and Buddy tells you
            what to fix and whether you have room to keep going.
          </StepRow>
        </div>
      </section>

      {/* safety: copy + fridge-magnet checklist */}
      <section style={{ background: 'var(--canvas)', borderTop: BORDER, borderBottom: BORDER, padding: '44px 22px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 36, alignItems: 'center' }}>
          <div style={{ flex: '1 1 380px', maxWidth: 620 }}>
            <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 30, margin: '0 0 10px' }}>Your dog&apos;s safety outranks the haircut</h2>
            <p style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--muted-1)', lineHeight: 1.65, margin: 0 }}>
              Buddy is grounded in a state-licensed grooming school&apos;s curriculum, and
              it keeps the school&apos;s rules: brush fully before any blade, tiny tips on
              nails, and a hard stop the moment something is beyond a home groom. Some
              grooms belong at a salon, and Buddy will tell you when yours is one of them.
            </p>
          </div>
          <div className="gbSticker" style={{ '--tilt': '1.6deg', flex: '1 1 300px', maxWidth: 380, background: '#fff', border: BORDER, borderRadius: 20, padding: '20px 22px', boxShadow: HARD } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ flex: 'none', width: 34, height: 34, padding: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', border: '2px solid var(--ink)', borderRadius: 10, boxShadow: HARD2 }}>{ICONS.shield}</span>
              <span style={{ fontFamily: FFD, fontWeight: 800, fontSize: 18 }}>Buddy&apos;s hard rules</span>
            </div>
            {[
              'Tight matting? See a pro.',
              'Wounds and lumps? See a vet.',
              'Stressed dog? Stop and settle.',
              'Never guesses at medical questions.',
            ].map((rule) => (
              <div key={rule} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '2px dashed var(--dashed-border)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ flex: 'none' }}><circle cx="12" cy="12" r="10" fill="var(--green-tint)" stroke="var(--ink)" strokeWidth="2.2" /><path d="M8 12.5l2.7 2.7L16.5 9" fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* pricing */}
      <section style={{ maxWidth: 1060, margin: '0 auto', padding: '48px 22px', display: 'flex', flexWrap: 'wrap', gap: 36, alignItems: 'center' }}>
        <Starburst big="$0" small="while in pilot" tilt={6} />
        <div style={{ flex: '1 1 380px', maxWidth: 660 }}>
          <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 30, margin: '0 0 12px' }}>What it costs</h2>
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.6, color: 'var(--muted-1)', margin: 0 }}>
            Free while it&apos;s in pilot, the whole thing. When paid plans arrive, the
            full custom plan for your dog will be a one-time purchase around $39,
            less than a single salon visit, and it stays yours. Early users will get
            a founding rate. This is an early product built by a small team; when an
            answer misses, you can tell us directly from inside the app.
          </p>
          <div style={{ marginTop: 20 }}>
            <CTA href="/">Open Grooming Buddy</CTA>
          </div>
        </div>
      </section>

      <Footer crossLink={{ href: '/welcome', label: 'for students and pros' }} />
    </main>
  );
}
