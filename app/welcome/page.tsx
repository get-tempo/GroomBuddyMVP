import type { Metadata } from 'next';
import { INK, BORDER, HARD2, FFD, CTA, Footer, StickerCard, ICONS, PhoneFrame, Doodle, StepRow, BentoCell, Starburst, DOTS_BG, DOODLES } from '../marketing-ui';

// Marketing landing page. Server-rendered, no client JS. Reuses the app's
// sticker design system (globals.css vars) so every "screenshot" here is the
// real UI style, not a mock. Copy rules: no em dashes, no hype, no fabricated
// numbers or testimonials, honest early-access framing.

export const metadata: Metadata = {
  title: 'Grooming Buddy — an AI coach for grooming students and new groomers',
  description:
    'Buddy builds a step-by-step plan for the exact dog on your table, answers questions mid-groom, and gives straight feedback on your work. Free while in pilot.',
};

// A real-looking slice of the product: one plan step + one chat exchange.
function PhoneDemo() {
  return (
    <PhoneFrame>
      <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 13, color: 'var(--muted-1)' }}>Goldendoodle · medium teddy · step 5 of 9</div>
      <div style={{ background: '#fff', border: BORDER, borderRadius: 16, padding: '12px 14px', boxShadow: HARD2 }}>
        <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 16 }}>Clipper the body</div>
        <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.5, marginTop: 6 }}>
          1. Snap a #4F blade or a 1/2&quot; comb over a #30.<br />
          2. Clip with the coat growth, shoulders to rear.<br />
          3. Keep the blade flat so you don&apos;t leave ridges.
        </div>
        <div style={{ marginTop: 8, background: 'var(--primary-soft)', border: `2px solid ${'var(--ink)'}`, borderRadius: 10, padding: '7px 10px', fontSize: 12.5, fontWeight: 700 }}>
          Pro tip: on a doodle, overlap each pass by half a blade width. Gaps show up after the coat settles.
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: '85%', background: 'var(--primary)', border: BORDER, borderRadius: 14, borderBottomRightRadius: 4, padding: '8px 11px', fontSize: 13, fontWeight: 700, boxShadow: HARD2 }}>
          The neck into the chest looks like it has a shelf. What do I do?
        </div>
      </div>
      <div style={{ maxWidth: '90%', background: '#fff', border: BORDER, borderRadius: 14, borderTopLeftRadius: 4, padding: '9px 12px', fontSize: 13, fontWeight: 600, lineHeight: 1.5, boxShadow: HARD2 }}>
        That shelf is a blend line. Switch to your longest comb, hold the clipper tip down, and skim the ridge in short upward flicks. Check it from the side at arm&apos;s length. You want one smooth curve from jaw to chest.
      </div>
    </PhoneFrame>
  );
}

export default function Welcome() {
  return (
    <main style={{ background: 'var(--cream)', color: INK, minHeight: '100dvh', overflowX: 'hidden' }}>
      {/* hero */}
      <section style={{ position: 'relative', ...DOTS_BG }}>
        <Doodle kind="scissors" size={54} top={40} left="4%" rotate={-18} delay={0.4} />
        <Doodle kind="paw" size={44} top={190} left="12%" rotate={14} opacity={0.25} delay={1.2} />
        <Doodle kind="bone" size={58} bottom={50} left="6%" rotate={8} delay={2} />
        <Doodle kind="sparkle" size={36} top={70} right="6%" rotate={10} opacity={0.8} delay={0.8} />
        <Doodle kind="paw" size={40} bottom={70} right="4%" rotate={-12} opacity={0.25} delay={1.6} />
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '54px 22px 44px', display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ flex: '1 1 420px', maxWidth: 560 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/Smileydogfunny.jpg" alt="Buddy" style={{ width: 44, height: 44, borderRadius: '50%', border: BORDER, objectFit: 'cover' }} />
              <span style={{ fontFamily: FFD, fontWeight: 800, fontSize: 20 }}>Grooming Buddy</span>
            </div>
            <h1 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 'clamp(34px, 6vw, 52px)', lineHeight: 1.08, margin: '0 0 10px' }}>
              Stuck mid-groom?<br />
              <span style={{ background: 'var(--primary)', border: BORDER, borderRadius: 14, padding: '0 14px 4px', boxShadow: HARD2, display: 'inline-block', transform: 'rotate(-1.2deg)' }}>Ask.</span>
            </h1>
            <span aria-hidden style={{ display: 'block', width: 150, height: 18, margin: '4px 0 14px' }}>{DOODLES.squiggle}</span>
            <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.6, color: 'var(--muted-1)', margin: '0 0 22px' }}>
              Buddy is an AI coach for grooming students and new groomers. It builds a
              step-by-step plan for the exact dog on your table, answers your questions
              while you work, and gives you straight feedback on photos of your groom.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <CTA href="/">Try it now, it&apos;s free</CTA>
              <CTA href="#schools" tone="plain">For schools</CTA>
            </div>
            <div style={{ marginTop: 14, fontSize: 13.5, fontWeight: 700, color: 'var(--muted-2)' }}>
              No signup. Works on your phone at the table.
            </div>
          </div>
          <PhoneDemo />
        </div>
      </section>

      {/* the pain: bento, one big scene + two supports */}
      <section style={{ background: 'var(--canvas)', borderTop: BORDER, borderBottom: BORDER, padding: '44px 22px', position: 'relative' }}>
        <Doodle kind="squiggle" size={70} top={22} right="8%" rotate={-6} opacity={0.4} />
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 30, margin: '0 0 22px' }}>You know this moment</h2>
          <div className="gbBento">
            <BentoCell span={4} tint="var(--primary-soft)" tilt={-0.5}>
              <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 260px' }}>
                  <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 'clamp(20px, 2.6vw, 26px)', lineHeight: 1.25, marginBottom: 10 }}>
                    Wet doodle on the table. Clipper in hand. And your mind goes blank.
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.6, color: 'var(--muted-1)' }}>
                    Your instructor is three tables away with their own dog. The clock is
                    running, the dog is patient for now, and you just need someone to say
                    what comes next.
                  </div>
                </div>
                <span aria-hidden style={{ width: 84, height: 84, flex: 'none', transform: 'rotate(8deg)', opacity: 0.85 }}>{DOODLES.paw}</span>
              </div>
            </BentoCell>
            <BentoCell span={2} tilt={0.8}>
              <span aria-hidden style={{ display: 'block', width: 40, height: 40, marginBottom: 8 }}>
                <svg viewBox="0 0 40 40" width="100%" height="100%"><rect x="4" y="8" width="32" height="24" rx="4" fill="none" stroke="var(--ink)" strokeWidth="2.4" /><path d="M17 14v12l10-6-10-6z" fill="var(--ink)" /></svg>
              </span>
              <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 17, marginBottom: 6 }}>The video is 40 minutes long</div>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.55, color: 'var(--muted-1)' }}>
                The answer is somewhere in a tutorial you can&apos;t scrub through with wet
                hands. You need one sentence, not an episode.
              </div>
            </BentoCell>
            <BentoCell span={2} tilt={-0.8}>
              <span aria-hidden style={{ display: 'block', width: 40, height: 40, marginBottom: 8 }}>
                <svg viewBox="0 0 40 40" width="100%" height="100%"><rect x="7" y="10" width="26" height="20" rx="6" fill="none" stroke="var(--ink)" strokeWidth="2.4" /><circle cx="16" cy="20" r="2.4" fill="var(--ink)" /><circle cx="24" cy="20" r="2.4" fill="var(--ink)" /><path d="M20 10V5M16 34h8" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" /></svg>
              </span>
              <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 17, marginBottom: 6 }}>Generic AI doesn&apos;t groom</div>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.55, color: 'var(--muted-1)' }}>
                A general chatbot gives confident answers with no method behind them. It
                has never heard of your school&apos;s way of doing things.
              </div>
            </BentoCell>
            <BentoCell span={4} tilt={0.4}>
              <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 17, marginBottom: 6 }}>Buddy is the instructor&apos;s voice between check-ins</div>
              <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.6, color: 'var(--muted-1)' }}>
                Ask in plain words, get the next step, the tool, and the technique cue,
                grounded in a real school&apos;s curriculum. Then keep grooming.
              </div>
            </BentoCell>
            <BentoCell span={2} tint="var(--green-tint)" tilt={-0.6}>
              <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 34, lineHeight: 1 }}>7 to 9</div>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.5, color: 'var(--green-text)', marginTop: 6 }}>
                steps in every plan, in the school&apos;s order, tailored to the dog in front of you.
              </div>
            </BentoCell>
          </div>
        </div>
      </section>

      {/* how it works: numbered zigzag */}
      <section style={{ maxWidth: 1060, margin: '0 auto', padding: '48px 22px', position: 'relative' }}>
        <Doodle kind="bone" size={48} top={30} right="3%" rotate={-14} opacity={0.25} delay={1} />
        <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 30, margin: '0 0 30px' }}>How it works</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          <StepRow n={1} title="Tell Buddy about the dog" doodle="paw" tint="var(--primary-soft)">
            Breed, coat condition, the style the client asked for. Twenty seconds of
            taps, with an Other option for everything.
          </StepRow>
          <StepRow n={2} title="Get the plan for that dog" doodle="scissors" tint="var(--green-tint)" flip>
            A 7 to 9 step plan in the school&apos;s method: order, tools, blade
            lengths, what good looks like, and the one thing to watch on each step.
          </StepRow>
          <StepRow n={3} title="Ask as you go" doodle="bubbles" tint="var(--neutral-fill)">
            Every step has its own chat. Send a photo and Buddy tells you what to
            fix first, located on the dog, no fluff. Voice input works with slippery hands.
          </StepRow>
        </div>
      </section>

      {/* why it's different */}
      <section style={{ background: 'var(--canvas)', borderTop: BORDER, borderBottom: BORDER, padding: '44px 22px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 30, margin: '0 0 8px' }}>A coach with a method, and honest</h2>
          <p style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--muted-1)', maxWidth: 720, lineHeight: 1.6, margin: '0 0 24px' }}>
            Buddy is built alongside a state-licensed professional grooming school and
            grounded in real curriculum, and it is being piloted by that school&apos;s
            students right now. It coaches the way an instructor does.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'stretch' }}>
            <StickerCard icon={ICONS.book} title="Grounded in real curriculum" tint="var(--primary-soft)" tilt={-1.3}>
              Answers come from a licensed school&apos;s materials, in an
              instructor&apos;s voice, never from generic internet advice.
            </StickerCard>
            <StickerCard icon={ICONS.paw} title="Knows breeds and coats" tilt={0.8}>
              A doodle&apos;s matting and a Schnauzer&apos;s skirt get different
              answers, tools, and blade lengths.
            </StickerCard>
            <StickerCard icon={ICONS.target} title="Leads with what to fix" tint="var(--green-tint)" tilt={-0.7}>
              Photo feedback starts with the problems, located on the dog, so you
              know exactly where to start.
            </StickerCard>
            <StickerCard icon={ICONS.sliders} title="Style choices are not errors" tilt={1.2}>
              A teddy head on a short summer body is a look, and Buddy knows the
              difference between a choice and a mistake.
            </StickerCard>
            <StickerCard icon={ICONS.shield} title="Safety first, always" tint="var(--primary-soft)" tilt={-1}>
              Brush before blades, tiny tips on nails, hot-blade checks. The
              school&apos;s safety rules are baked into every plan.
            </StickerCard>
            <StickerCard icon={ICONS.person} title="Knows when you need a human" tilt={0.9}>
              Tight matting, a stressed dog, anything medical: Buddy tells you to
              stop and get a person. It coaches between instructors, it never
              replaces one.
            </StickerCard>
          </div>
        </div>
      </section>

      {/* pricing */}
      <section style={{ maxWidth: 1060, margin: '0 auto', padding: '48px 22px', display: 'flex', flexWrap: 'wrap', gap: 36, alignItems: 'center' }}>
        <Starburst big="$0" small="while in pilot" />
        <div style={{ flex: '1 1 380px', maxWidth: 660 }}>
          <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 30, margin: '0 0 12px' }}>What it costs</h2>
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.6, color: 'var(--muted-1)', margin: 0 }}>
            Free while it&apos;s in pilot. When paid plans arrive they&apos;ll be around
            $19 a month for individuals, and early users will get a founding rate.
            This is an early product: some answers will miss, and when they do you can
            tell the person who built it directly from inside the app.
          </p>
          <div style={{ marginTop: 20 }}>
            <CTA href="/">Open Grooming Buddy</CTA>
          </div>
        </div>
      </section>

      {/* schools */}
      <section id="schools" style={{ background: 'var(--ink)', color: 'var(--cream)', padding: '48px 22px', position: 'relative', overflow: 'hidden' }}>
        <span aria-hidden style={{ position: 'absolute', top: 20, right: '5%', width: 90, height: 30, opacity: 0.5 }}>
          <svg viewBox="0 0 60 20" width="100%" height="100%"><path d="M3 12c5-8 9 8 14 0s9 8 14 0 9 8 14 0 9 8 12 2" fill="none" stroke="var(--primary)" strokeWidth="2.4" strokeLinecap="round" /></svg>
        </span>
        <span aria-hidden style={{ position: 'absolute', bottom: 14, left: '3%', width: 54, height: 54, opacity: 0.3 }}>
          <svg viewBox="0 0 40 40" width="100%" height="100%"><circle cx="12" cy="14" r="3.2" fill="none" stroke="var(--cream)" strokeWidth="2.4" /><circle cx="20" cy="11" r="3.2" fill="none" stroke="var(--cream)" strokeWidth="2.4" /><circle cx="28" cy="14" r="3.2" fill="none" stroke="var(--cream)" strokeWidth="2.4" /><path d="M20 19c-5 0-9 4-9 7.8 0 2.6 2 4.6 4.6 4.6 1.7 0 3-.7 4.4-.7s2.7.7 4.4.7c2.6 0 4.6-2 4.6-4.6C29 23 25 19 20 19z" fill="none" stroke="var(--cream)" strokeWidth="2.4" /></svg>
        </span>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 28, margin: '0 0 12px', color: 'var(--primary)' }}>
            For grooming schools: your curriculum, your method, your brand
          </h2>
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.65, maxWidth: 760, margin: '0 0 18px', opacity: 0.92 }}>
            Your students already ask AI questions mid-groom, and today it answers with
            no method at all. Buddy lets your school own that moment instead: an
            instance branded to your school, grounded in your curriculum and video
            library, answering in your voice, with your safety rules. Your materials
            stay yours.
          </p>
          <a
            href="mailto:andrew+julian@get-tempo.com?subject=Grooming%20Buddy%20for%20our%20school"
            style={{ display: 'inline-block', background: 'var(--primary)', color: INK, border: `2.5px solid var(--cream)`, borderRadius: 999, padding: '13px 26px', fontFamily: FFD, fontWeight: 800, fontSize: 16, textDecoration: 'none' }}
          >
            Talk to us about a pilot
          </a>
        </div>
      </section>

      <Footer crossLink={{ href: '/diy', label: 'for home groomers' }} />
    </main>
  );
}
