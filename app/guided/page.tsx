'use client';

import { useState } from 'react';
import { GROOM_STEPS } from '@/data/groom-steps';

// Interface A: guided step co-pilot. Setup first (the dog + goal), THEN reveal
// all the steps so they can see everything and drill into any one.
//
// TEMP: step detail is read from the hard-coded `detail` in data/groom-steps.ts
// so this is demoable with no API key. When the model is wired in, swap the
// detail panel back to a per-step model call (sendMessage + Thread).
export default function Guided() {
  const [started, setStarted] = useState(false);
  const [breed, setBreed] = useState('');
  const [goal, setGoal] = useState('');
  const [active, setActive] = useState<string | null>(null);

  const activeIndex = GROOM_STEPS.findIndex((s) => s.id === active);

  if (!started) {
    return (
      <div className="setup">
        <h1>Who are we grooming today?</h1>
        <p className="sub">Tell me a couple things and I&apos;ll walk you through the whole groom.</p>
        <label htmlFor="g-breed">What&apos;s the pup?</label>
        <input
          id="g-breed"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="breed or coat, like a Shih Tzu"
        />
        <label htmlFor="g-goal">What are we going for? (optional)</label>
        <input
          id="g-goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="puppy cut, breed trim, just a tidy-up…"
        />
        <button className="primary" onClick={() => setStarted(true)} disabled={!breed.trim()}>
          Let&apos;s go ▸
        </button>
      </div>
    );
  }

  return (
    <div className="guided">
      <div className="groomhead">
        <span className="chip">
          {breed}
          {goal ? ` · ${goal}` : ''}
        </span>
        <button
          className="reset"
          onClick={() => {
            setStarted(false);
            setActive(null);
          }}
        >
          edit
        </button>
      </div>

      <div className="progress" aria-hidden>
        {GROOM_STEPS.map((s, i) => (
          <span key={s.id} className={`seg${i <= activeIndex ? ' on' : ''}`} />
        ))}
      </div>

      <ol className="steps">
        {GROOM_STEPS.map((s, i) => (
          <li key={s.id}>
            <button
              className={`step${active === s.id ? ' active' : ''}`}
              onClick={() => setActive(active === s.id ? null : s.id)}
            >
              <span className="num">{i + 1}</span>
              <span className="stepbody">
                <strong>{s.name}</strong>
                <em>{s.blurb}</em>
              </span>
            </button>

            {active === s.id && (
              <div className="stepdetail">
                <div className="row">
                  <span className="lbl">Where you&apos;re at</span>
                  <p>{s.detail.read}</p>
                </div>
                <div className="row">
                  <span className="lbl">Do this next</span>
                  <p>{s.detail.next}</p>
                </div>
                <div className="row">
                  <span className="lbl">How</span>
                  <p>{s.detail.how}</p>
                </div>
                <div className="row">
                  <span className="lbl">Looks good when</span>
                  <p>{s.detail.good}</p>
                </div>
                <div className="row">
                  <span className="lbl">Heads up</span>
                  <p>{s.detail.watch}</p>
                </div>
                {s.image && (
                  <figure className="ref">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image.url} alt={s.image.caption} />
                    <figcaption>{s.image.caption}</figcaption>
                  </figure>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
