import type { Metadata } from 'next';
import { INK, BORDER, HARD, HARD2, FFD, Pill, Card, CTA, Footer } from '../marketing-ui';

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
    <div style={{ width: 320, maxWidth: '92vw', background: 'var(--cream)', border: BORDER, borderRadius: 26, boxShadow: '6px 6px 0 var(--ink)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
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
    </div>
  );
}

export default function Diy() {
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
            Groom your own dog.<br />Stop guessing.
          </h1>
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
      </section>

      {/* the pain */}
      <section style={{ background: 'var(--canvas)', borderTop: BORDER, borderBottom: BORDER, padding: '40px 22px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 28, margin: '0 0 20px' }}>Why you&apos;re here</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Card title="The salon bill keeps coming">
              A doodle needs grooming every 4 to 8 weeks, and salon visits commonly
              run $60 to $120 each. That adds up to serious money every year, per dog.
            </Card>
            <Card title="The video is for someone else&apos;s dog">
              Your dog&apos;s coat, mats, and patience are not the ones in the
              tutorial. You need answers about the dog in front of you.
            </Card>
            <Card title="One bad snip ruins your confidence">
              Nails, ears, and mats are exactly where owners get scared, and
              where guessing actually can hurt your dog. That fear is reasonable.
            </Card>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section style={{ maxWidth: 1060, margin: '0 auto', padding: '44px 22px' }}>
        <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 28, margin: '0 0 20px' }}>How it works</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Card title="1 · Tell Buddy about your dog">
            Breed or mix, how matted the coat is, and the look you want. Twenty
            seconds of taps. Honest answers get honest plans.
          </Card>
          <Card title="2 · Get your dog&apos;s plan">
            A full plan in the right order (nails and prep first, bath, brush-out,
            then the haircut), with the tools and the one thing to watch at each step.
          </Card>
          <Card title="3 · Ask whenever you&apos;re unsure">
            Every step has a chat. Send a photo mid-groom and Buddy tells you
            what to fix and whether you have room to keep going.
          </Card>
        </div>
      </section>

      {/* safety and honesty */}
      <section style={{ background: 'var(--canvas)', borderTop: BORDER, borderBottom: BORDER, padding: '40px 22px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 28, margin: '0 0 8px' }}>Your dog&apos;s safety outranks the haircut</h2>
          <p style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--muted-1)', maxWidth: 720, lineHeight: 1.6, margin: '0 0 20px' }}>
            Buddy is grounded in a state-licensed grooming school&apos;s curriculum, and
            it keeps the school&apos;s rules: brush fully before any blade, tiny tips on
            nails, and a hard stop the moment something is beyond a home groom. Some
            grooms belong at a salon, and Buddy will tell you when yours is one of them.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Pill>Tight matting? See a pro</Pill>
            <Pill>Wounds and lumps? See a vet</Pill>
            <Pill>Stressed dog? Stop and settle</Pill>
            <Pill>Never guesses at medical questions</Pill>
          </div>
        </div>
      </section>

      {/* pricing */}
      <section style={{ maxWidth: 1060, margin: '0 auto', padding: '44px 22px' }}>
        <h2 style={{ fontFamily: FFD, fontWeight: 800, fontSize: 28, margin: '0 0 12px' }}>What it costs</h2>
        <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.6, color: 'var(--muted-1)', maxWidth: 720, margin: 0 }}>
          Free while it&apos;s in pilot, the whole thing. When paid plans arrive, the
          full custom plan for your dog will be a one-time purchase around $39,
          less than a single salon visit, and it stays yours. Early users will get
          a founding rate. This is an early product built by a small team; when an
          answer misses, you can tell us directly from inside the app.
        </p>
        <div style={{ marginTop: 20 }}>
          <CTA href="/">Open Grooming Buddy</CTA>
        </div>
      </section>

      <Footer crossLink={{ href: '/welcome', label: 'for students and pros' }} />
    </main>
  );
}
