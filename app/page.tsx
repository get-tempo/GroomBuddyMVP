import Link from 'next/link';

// Demo landing. Conversational, like the instructor talking to a student.
export default function Home() {
  return (
    <div className="home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero" src="/art/Smileydogfunny.jpg" alt="A very happy dog in a flower crown" />
      <h1>Hey, I&apos;m Buddy.</h1>
      <p className="sub">
        Stuck on a groom, or just want a second set of eyes? I&apos;ve got you. How do you
        want to roll today?
      </p>
      <div className="choices">
        <Link href="/guided" className="choice">
          <h2>Walk me through it</h2>
          <p>
            We&apos;ll do the whole groom together, start to finish. Tap any step and
            I&apos;ll talk you through exactly what to do.
          </p>
        </Link>
        <Link href="/quick" className="choice">
          <h2>Just the quick stuff</h2>
          <p>
            Already know what you need? One tap. What&apos;s next, how&apos;s it looking,
            how do I, or wait-is-this-okay.
          </p>
        </Link>
      </div>
    </div>
  );
}
