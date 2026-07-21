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
//   "topics": ["body clip", "clipper", "even length", "blade"],  // ranking keywords
//   "require": ["clip", "clipper", "blade"],   // HARD GATE: >=1 must appear in the step
//   "exclude": ["ears", "nails"],              // HARD GATE: any hit vetoes the match
//   "breeds": ["Goldendoodle", "doodle"],      // HARD GATE when set: breed must match
//   "start": 75,                                 // optional, seconds: jump past the intro
//   "end": 240                                   // optional, seconds: stop before the outro
// }
// `start`/`end` let a clip play only the useful part instead of the whole video.
//
// Matching is two-stage, because a wrong video is worse than none:
// 1. Gates: `require` (the technique this clip actually teaches must be named in
//    the step), `exclude` (steps this clip must never appear on, e.g. the ear-
//    SCISSORING clip is vetoed on the ear-CLEANING/plucking step), and `breeds`
//    (a coat-specific clip only shows for that kind of dog).
// 2. Ranking: keyword overlap of title+topics against the step text, with a
//    minimum score so one stray shared word still isn't enough.
import manifest from '@/data/video-bank.json';

export interface StepVideo {
  youtubeId: string;
  title: string;
  duration?: string;
  topics: string[];
  require?: string[];
  exclude?: string[];
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
  const anyIn = (words: string[] | undefined) =>
    !!words && tokens(words.join(' ')).some((w) => q.has(w));
  let best: StepVideo | null = null;
  let bestScore = 0;
  for (const v of manifest as StepVideo[]) {
    if (anyIn(v.exclude)) continue; // vetoed for this step
    if (v.require && !anyIn(v.require)) continue; // technique not named in the step
    if (v.breeds && v.breeds.length > 0 && !anyIn(v.breeds)) continue; // wrong dog for a coat-specific clip
    const hay = tokens([v.title, ...(v.topics ?? [])].join(' '));
    let score = 0;
    for (const w of hay) if (q.has(w)) score++;
    if (score > bestScore) {
      best = v;
      bestScore = score;
    }
  }
  return bestScore >= MIN_SCORE ? best : null;
}
