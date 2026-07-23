import type { Metadata } from 'next';
import Link from 'next/link';

// Marketing landing page. Server-rendered, no client JS. Reuses the app's
// sticker design system (globals.css vars) so every "screenshot" here is the
// real UI style, not a mock. Copy rules: no em dashes, no hype, no fabricated
// numbers or testimonials, honest early-access framing.

export const metadata: Metadata = {
  title: 'Grooming Buddy — an AI coach for grooming students and new groomers',
  description:
    'Buddy builds a step-by-step plan for the exact dog on your table, answers questions mid-groom, and gives straight feedback on your work. Free while in pilot.',
};

const INK = 'var(--ink)';
const BORDER = `2.5px solid ${INK}`;
const HARD = `3px 3px 0 ${INK}`;
const HARD2 = `2px 2px 0 ${INK}`;
const FFD = 'var(--font-display)';

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-block', background: '#fff', border: BORDER, borderRadius: 999, padding: '6px 14px', fontFamily: FFD, fontWeight: 800, fontSize: 14, boxShadow: HARD2, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: BORDER, borderRadius: 18, padding: '18px 20px', boxShadow: HARD, flex: '1 1 240px', minWidth: 240 }}>
      <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 17, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.55, color: 'var(--muted-1)' }}>{children}</div>
    </div>
  );
}

function CTA({ href, children, tone }: { href: string; children: React.ReactNode; tone?: 'plain' }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-block', background: tone === 'plain' ? '#fff' : 'var(--primary)', color: INK,
        border: BORDER, borderRadius: 999, padding: '13px 26px', fontFamily: FFD, fontWeight: 800,
        fontSize: 16, textDecoration: 'none', boxShadow: HARD,
      }}
    >
      {children}
    </Link>
  );
}

// A real-looking slice of the product: one plan step + one chat exchange.
function PhoneDemo() {
  return (
    <div style={{ width: 320, maxWidth: '92vw', background: 'var(--cream)', border: BORDER, borderRadius: 26, boxShadow: '6px 6px 0 var(--ink)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
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
    </div>
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
          <p style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--muted-1)', maxWidth: 720, lineHeight: 1.6, margin: '0 0 20px' }}>
            Buddy is built alongside a state-licensed professional grooming school and
            grounded in real curriculum, and it is being piloted by that school&apos;s
            students right now. It coaches the way an instructor does.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Pill>Grounded in real curriculum</Pill>
            <Pill>Knows breeds and coats</Pill>
            <Pill>Leads with what to fix</Pill>
            <Pill>Style choices are not errors</Pill>
            <Pill>Safety first, always</Pill>
            <Pill>Tells you when to get a human</Pill>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted-1)', maxWidth: 720, lineHeight: 1.6, margin: '18px 0 0' }}>
            Buddy is a coach between instructors, never a replacement for one. If a
            groom turns risky (tight matting, a stressed dog, anything medical) it
            tells you to stop and get a person. The dog&apos;s safety outranks your
            deadline and ours.
          </p>
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

      <footer style={{ padding: '26px 22px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--muted-2)' }}>
        Grooming Buddy · early access · <a href="mailto:andrew+julian@get-tempo.com" style={{ color: 'var(--muted-1)' }}>contact</a>
      </footer>
    </main>
  );
}
