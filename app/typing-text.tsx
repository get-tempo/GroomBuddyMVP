'use client';

// Typewriter loop for the hero chat pill: types a question, holds, deletes,
// types the next. Falls back to the first prompt, static, under
// prefers-reduced-motion.
import { useEffect, useState } from 'react';

export default function TypingText({ prompts }: { prompts: string[] }) {
  const [txt, setTxt] = useState(prompts[0] ?? '');
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTxt(prompts[0] ?? '');
      return;
    }
    let i = 0;
    let pos = 0;
    let deleting = false;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const cur = prompts[i];
      if (!deleting) {
        pos += 1;
        setTxt(cur.slice(0, pos));
        if (pos === cur.length) { deleting = true; t = setTimeout(tick, 1900); return; }
        t = setTimeout(tick, 42);
      } else {
        pos -= 1;
        setTxt(cur.slice(0, pos));
        if (pos === 0) { deleting = false; i = (i + 1) % prompts.length; t = setTimeout(tick, 400); return; }
        t = setTimeout(tick, 20);
      }
    };
    setTxt('');
    t = setTimeout(tick, 700);
    return () => clearTimeout(t);
  }, [prompts]);
  return <>{txt}</>;
}
