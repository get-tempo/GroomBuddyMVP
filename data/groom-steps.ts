// The canonical 9-step groom, with per-step coaching content.
// Content is verbatim from the Claude Design handoff prototype (the school's
// curriculum voice). This is now the FALLBACK plan: Guided mode generates a
// per-dog plan from breed + coat + goal (see /api/plan), and only falls back to
// this hard-coded teddy-bear Goldendoodle plan if generation fails.

export interface GroomStep {
  /** Short step title. */
  t: string;
  /** One-line what & why. */
  quickRead: string;
  /** The concrete next action(s). */
  doNext: string;
  /** The technique cue, in Buddy's voice. */
  cue: string;
  /** What good looks like. */
  good: string;
  /** The one common mistake to avoid. */
  watch: string;
  /** Reference-photo caption key. */
  ref: string;
}

export const GROOM_STEPS: GroomStep[] = [
  {
    t: 'Bath & blow-dry',
    quickRead: 'Clean coat, fully dried. Mats love to hide in damp fur.',
    doNext: 'Lukewarm water, lather down to the skin, rinse till it runs clear. Force-dry while you brush.',
    cue: 'Dry in the direction the coat grows.',
    good: 'Coat squeaky-clean, bone dry and fluffed.',
    watch: 'Water in the ears, pop in cotton first.',
    ref: 'clean fluffed coat',
  },
  {
    t: 'Brush out & de-mat',
    quickRead: 'Get every tangle out before any blade touches her.',
    doNext: 'Line-brush in small sections, then comb through to check each one.',
    cue: "If the comb snags, that section isn't done.",
    good: 'Comb glides head to tail with no snags.',
    watch: "Tight mats near the skin: don't yank. If it won't release, hand it off.",
    ref: 'mat-free brushed coat',
  },
  {
    t: 'Clipper the body',
    quickRead: 'Even length over the body with smooth, clean lines.',
    doNext: 'Clip with the grain in long strokes, keeping the skin pulled taut.',
    cue: "Let the clipper do the work, don't press down.",
    good: 'Even coat, no lines or steps.',
    watch: 'Hot blade, check it on your wrist often.',
    ref: 'even body clip',
  },
  {
    t: 'Tidy ears & clean',
    quickRead: 'Clean, check, then neaten the ear edges.',
    doNext: 'Wipe the leather, pluck only if you were taught to, scissor any stray edges.',
    cue: 'Hold the ear flat against your fingers to trim it safely.',
    good: 'Edges clean and even, canal looks clear.',
    watch: "Redness, smell or gunk: flag it, don't dig.",
    ref: 'neat ear edges',
  },
  {
    t: 'Scissor the face',
    quickRead: 'Round, soft, teddy-bear look. Comb the hair forward, then shape a circle, short on the muzzle, fuller on the cheeks.',
    doNext: 'Curved shears, tips pointed away from the eyes. Start at the bridge of the nose and work outward.',
    cue: "Tiny snips, comb, look. Don't chase one spot, keep circling the whole face.",
    good: 'A symmetrical circle with no sharp corners near the eyes.',
    watch: 'Points forming by the eyes, soften them right away.',
    ref: 'finished teddy-bear face',
  },
  {
    t: 'Tidy the feet & pads',
    quickRead: 'Neat round feet with the fur cleared off the pads.',
    doNext: 'Gently clipper the pads, then scissor a round shape around each foot.',
    cue: 'Stand her square so the feet look even to each other.',
    good: 'Tidy rounds, no fur poking out between the toes.',
    watch: 'The skin between pads is thin, tiny careful snips only.',
    ref: 'rounded tidy feet',
  },
  {
    t: 'Sanitary trim',
    quickRead: 'Clean and comfortable, tidy, not bare.',
    doNext: 'Short guard on the clipper, work gently over the sanitary areas.',
    cue: 'Go slow and keep the skin smooth as you go.',
    good: 'Tidy and clean with no irritation.',
    watch: 'Very sensitive skin here, pause the second she tenses up.',
    ref: 'clean sanitary area',
  },
  {
    t: 'Nails',
    quickRead: 'Short enough not to touch the floor, and never into the quick.',
    doNext: 'Take tiny tips at a time. Look for the pale circle in the center before you stop.',
    cue: 'When you see the dot in the middle of the nail, stop.',
    good: 'Nails just off the floor with smooth edges.',
    watch: 'Bleeding or a yelp: stop. This is a get-a-person moment.',
    ref: 'short smooth nails',
  },
  {
    t: 'Final check',
    quickRead: 'Walk around her once, check symmetry and stray hairs.',
    doNext: 'Comb everything out, check both sides match, then last tidy snips.',
    cue: 'Step back and look at her straight from the front.',
    good: 'Balanced, clean and ready for the parent.',
    watch: "Don't over-fuss a tired dog, call it when she's done.",
    ref: 'finished groom, both sides',
  },
];
