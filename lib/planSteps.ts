// Shared plan-step parsing: used by the /api/plan route AND the client, which
// parses the streamed text incrementally so steps render as the model writes
// them (first step on screen in a few seconds instead of a 20-40s wait).
import { z } from 'zod';
import type { GroomStep } from '@/data/groom-steps';

// Mirrors the GroomStep shape the UI renders (data/groom-steps.ts).
export const stepSchema = z.object({
  t: z.string(),
  quickRead: z.string(),
  // 2-4 concrete ordered actions. Tolerate a bare string by wrapping it.
  doNext: z.preprocess(
    (v) => (typeof v === 'string' ? [v] : v),
    z.array(z.string()).min(1).max(6),
  ),
  cue: z.string(),
  good: z.string(),
  watch: z.string(),
  ref: z.string(),
});

// Salvage the step objects from the model's text. We scan for balanced { } blocks
// and keep the ones that validate as a step, so it's robust to code fences, stray
// prose, and a truncated final object (that block won't balance -> skipped) rather
// than throwing the whole plan away. Works whether the model wraps the steps in
// {"steps":[...]} or returns a bare [...] array — and, crucially, on a PARTIAL
// stream: complete leading objects parse, the unfinished tail is ignored.
export function parsePlanSteps(text: string): GroomStep[] {
  const steps: GroomStep[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        try {
          const parsed = stepSchema.safeParse(JSON.parse(text.slice(start, i + 1)));
          if (parsed.success) steps.push(parsed.data as GroomStep);
        } catch {
          // not a JSON object / not a step — skip it
        }
        start = -1;
      }
    }
  }
  return steps;
}
