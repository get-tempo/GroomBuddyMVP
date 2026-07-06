// Approved technique-video bank. Curated YouTube clips that the school has
// vetted as good + on-method. A step only shows a video if one clearly matches
// (same idea as the reference image bank: a wrong/irrelevant video is worse than
// none), so the bank starts EMPTY and steps show no video until you add entries.
//
// To add a video, append an object to data/video-bank.json:
// {
//   "youtubeId": "dQw4w9WgXcQ",              // the id after ?v= in the URL
//   "title": "Even body clip on a doodle",   // shown under the player
//   "duration": "0:45",                        // optional, display only
//   "topics": ["body clip", "clipper", "even length", "blade"],  // match keywords
//   "breeds": ["Goldendoodle", "doodle"],      // optional, narrows the match
//   "start": 75,                                 // optional, seconds: jump past the intro
//   "end": 240                                   // optional, seconds: stop before the outro
// }
// `start`/`end` let a clip play only the useful part instead of the whole video.
// Match is by keyword overlap against the step (title + reference caption + breed),
// so put the concepts a student would be on that step for into `topics`.
import manifest from '@/data/video-bank.json';

export interface StepVideo {
  youtubeId: string;
  title: string;
  duration?: string;
  topics: string[];
  breeds?: string[];
  start?: number; // seconds, skip the intro
  end?: number; // seconds, stop before the outro
}

const MIN_SCORE = 2; // need a real overlap, not one stray word

function tokens(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => w.length > 2);
}

// Best-matching approved video for a step, or null if nothing clears the bar.
export function findStepVideo(query: string): StepVideo | null {
  const q = new Set(tokens(query));
  let best: StepVideo | null = null;
  let bestScore = 0;
  for (const v of manifest as StepVideo[]) {
    const hay = tokens([v.title, ...(v.topics ?? []), ...(v.breeds ?? [])].join(' '));
    let score = 0;
    for (const w of hay) if (q.has(w)) score++;
    if (score > bestScore) {
      best = v;
      bestScore = score;
    }
  }
  return bestScore >= MIN_SCORE ? best : null;
}
