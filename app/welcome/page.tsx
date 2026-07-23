import type { Metadata } from 'next';
import { INK, BORDER, HARD2, FFD, Card, CTA, Footer, StickerCard, ICONS, PhoneFrame } from '../marketing-ui';

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
      <section style={{ maxWidth: 1060, margin: '0 auto', padding: '54px 22px 30px', display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ flex: '1 1 420px', maxWidth: 560 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/Smileydogfunny.jpg" alt="Buddy" style={{ width: 44, height: 44, borderRadius: '50%', border: BORDER, objectFit: 'cover' }} />
            <span style={{ fontFamily: FFD, fontWeight: 800, fontSize: 20 }}>Grooming Buddy</span>
          </div>
          <h1 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 'clamp(34px, 6vw, 52px)', lineHeight: 1.08, margin: '0 0 16px' }}>
            Stuck mid-groom?<br />Ask.
          </h1>
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
      </section>

      {/* the pain */}
      <section style={{ background: 'var(--canvas)', borderTop: BORDER, borderBottom: BORDER, padding: '40px 22px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 28, margin: '0 0 20px' }}>You know this moment</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Card title="The dog is on the table">
              Wet doodle, clipper in hand, and you blank on what comes next. Your
              instructor is three tables away with their own dog.
            </Card>
            <Card title="The video is 40 minutes long">
              The answer is somewhere in a tutorial you can&apos;t scrub through with
              wet hands. You need one sentence, not an episode.
            </Card>
            <Card title="Generic AI doesn&apos;t groom">
              A general chatbot gives confident answers with no method behind them.
              It has never heard of your school&apos;s way of doing things.
            </Card>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section style={{ maxWidth: 1060, margin: '0 auto', padding: '44px 22px' }}>
        <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 28, margin: '0 0 20px' }}>How it works</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Card title="1 · Tell Buddy about the dog">
            Breed, coat condition, the style the client asked for. Twenty seconds of
            taps, with an Other option for everything.
          </Card>
          <Card title="2 · Get the plan for that dog">
            A 7 to 9 step plan in the school&apos;s method: order, tools, blade
            lengths, what good looks like, and the one thing to watch on each step.
          </Card>
          <Card title="3 · Ask as you go">
            Every step has its own chat. Send a photo and Buddy tells you what to
            fix first, located on the dog, no fluff. Voice input works with slippery hands.
          </Card>
        </div>
      </section>

      {/* why it's different */}
      <section style={{ background: 'var(--canvas)', borderTop: BORDER, borderBottom: BORDER, padding: '40px 22px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 28, margin: '0 0 8px' }}>A coach with a method, and honest</h2>
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

      {/* pricing honesty */}
      <section style={{ maxWidth: 1060, margin: '0 auto', padding: '44px 22px' }}>
        <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 28, margin: '0 0 12px' }}>What it costs</h2>
        <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.6, color: 'var(--muted-1)', maxWidth: 720, margin: 0 }}>
          Free while it&apos;s in pilot. When paid plans arrive they&apos;ll be around
          $19 a month for individuals, and early users will get a founding rate.
          This is an early product: some answers will miss, and when they do you can
          tell the person who built it directly from inside the app.
        </p>
        <div style={{ marginTop: 20 }}>
          <CTA href="/">Open Grooming Buddy</CTA>
        </div>
      </section>

      {/* schools */}
      <section id="schools" style={{ background: 'var(--ink)', color: 'var(--cream)', padding: '48px 22px' }}>
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
