// Reference image bank: keyed lookup over a small JSON manifest.
// Per the spec (docs/reference-image-bank-spec.md), the student states breed +
// task, so a simple keyed/keyword match is enough for the MVP. No embeddings.
// Upgrade to semantic search only if real student phrasing starts missing.

import manifest from '@/data/image-manifest.json';

export type ReferenceImage = {
  id: string;
  url: string;
  title: string;
  caption: string;
  teaching_point: string;
  topics: string[];
  breeds: string[];
  tags: string[];
};

export type ReferenceMatch = ReferenceImage & { score: number };

const BANK = manifest as ReferenceImage[];

// Minimum score to surface an image at all. Below this we show NOTHING and
// describe in words (the "never show a wrong dog" trust rule).
const MIN_SCORE = 2;

function tokens(s: string): string[] {
  return s.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

/**
 * Keyword-overlap scoring against each image's searchable fields.
 * Deliberately simple and debuggable. Returns only matches above MIN_SCORE.
 */
export function findReferenceImages(query: string, maxResults = 3): ReferenceMatch[] {
  const q = new Set(tokens(query));
  if (q.size === 0) return [];

  const scored = BANK.map((img) => {
    const haystack = [
      img.title,
      img.topics.join(' '),
      img.breeds.join(' '),
      img.tags.join(' '),
    ].join(' ');
    const hay = new Set(tokens(haystack));
    let score = 0;
    for (const t of q) if (hay.has(t)) score += 1;
    return { ...img, score };
  });

  return scored
    .filter((m) => m.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
