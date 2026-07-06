// The canonical 9-step groom, with per-step coaching content.
// This is the FALLBACK plan: Guided mode generates a per-dog plan from breed +
// coat + goal (see /api/plan), and only falls back to this hard-coded teddy-bear
// Goldendoodle plan if generation fails.

export interface GroomStep {
  /** Short step title. */
  t: string;
  /** One-line what & why. */
  quickRead: string;
  /** The concrete actions to take now, as a short ordered checklist. */
  doNext: string[];
  /** One genuinely useful technique cue, in Buddy's voice (never filler). */
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
    doNext: [
      'Wet the coat with lukewarm water, then lather shampoo down to the skin, not just the surface.',
      'Rinse until the water runs completely clear, and follow with conditioner on a dry or curly coat.',
      'Squeeze out the excess, then high-velocity dry while you brush the coat straight in sections.',
    ],
    cue: 'Keep the dryer moving and brush as you go. A dryer parked on one spot frizzes the curl and can overheat the skin.',
    good: 'Coat squeaky-clean, bone dry, and fluffed straight with no damp spots.',
    watch: 'Water in the ears, pop in cotton first.',
    ref: 'clean fluffed coat',
  },
  {
    t: 'Brush out & de-mat',
    quickRead: 'Get every tangle out before any blade touches her.',
    doNext: [
      'Work in small sections from the skin out, using a slicker to lift and separate the coat.',
      'Follow each section with a comb to confirm it glides cleanly before you move on.',
      'For tight spots, hold the hair at the base and gently tease the mat apart.',
    ],
    cue: 'If the comb catches, that section is not done. Finish it now, or you drag mats into the blade later.',
    good: 'Comb glides head to tail with no snags.',
    watch: "Tight mats near the skin: don't yank. If it won't release, hand it off.",
    ref: 'mat-free brushed coat',
  },
  {
    t: 'Clipper the body',
    quickRead: 'Even length over the body with smooth, clean lines.',
    doNext: [
      'Set your blade or comb length for the style, then start at the neck and clip with the grain down the body.',
      'Keep the skin pulled taut and take long, even strokes so you leave no tracks.',
      'Blend the body into the legs with a scooping motion, then smooth any lines with thinning shears.',
    ],
    cue: 'Let the clipper glide, do not press. Pressing digs a line and heats the blade fast.',
    good: 'Even coat, no lines or steps.',
    watch: 'Hot blade, check it on your wrist often.',
    ref: 'even body clip',
  },
  {
    t: 'Tidy ears & clean',
    quickRead: 'Clean, check, then neaten the ear edges.',
    doNext: [
      'Wipe the ear leather clean and check inside for redness, smell, or debris.',
      'Pluck only if you were trained to and the dog tolerates it.',
      'Comb the ear fringe down and scissor the edges to a clean, even line.',
    ],
    cue: 'Hold the ear flat against your fingers as you scissor, so you never cut toward loose skin.',
    good: 'Edges clean and even, canal looks clear.',
    watch: "Redness, smell or gunk: flag it, don't dig.",
    ref: 'neat ear edges',
  },
  {
    t: 'Scissor the face',
    quickRead: 'Round, soft, teddy-bear look. Short on the muzzle, fuller on the cheeks.',
    doNext: [
      'Comb all the facial hair forward, then set the length at the tip of the muzzle first.',
      'Work outward in tiny snips, shaping a round outline, shorter on the muzzle and fuller on the cheeks.',
      'Comb and check often, softening any corners near the eyes as you go.',
    ],
    cue: 'Point the shear tips away from the eyes and cut on the comb, never toward the dog.',
    good: 'A symmetrical circle with no sharp corners near the eyes.',
    watch: 'Points forming by the eyes, soften them right away.',
    ref: 'finished teddy-bear face',
  },
  {
    t: 'Tidy the feet & pads',
    quickRead: 'Neat round feet with the fur cleared off the pads.',
    doNext: [
      'Clipper the hair off the bottom pads with a light touch to expose clean pads.',
      'Comb the foot hair up and out, then scissor a neat round shape following the paw.',
      'Stand the dog square and check the feet match each other.',
    ],
    cue: 'The skin between the pads is thin. Use just the tip of the clipper and tiny snips.',
    good: 'Tidy rounds, no fur poking out between the toes.',
    watch: 'Sharp points near the pads, keep the scissor tips flat to the foot.',
    ref: 'rounded tidy feet',
  },
  {
    t: 'Sanitary trim',
    quickRead: 'Clean and comfortable, tidy, not bare.',
    doNext: [
      'Put on a short guard or a 10 blade and comb the area smooth first.',
      'Clip gently around the sanitary areas, pushing the skin away from the blade as you go.',
      'Keep it tidy, not bald, and stop the moment she tenses up.',
    ],
    cue: 'Skin here is loose and sensitive. Keep it pulled flat and go slow, one pass at a time.',
    good: 'Tidy and clean with no irritation.',
    watch: 'Very sensitive skin here, pause the second she tenses up.',
    ref: 'clean sanitary area',
  },
  {
    t: 'Nails',
    quickRead: 'Short enough not to touch the floor, and never into the quick.',
    doNext: [
      'Hold the paw steady and take tiny tips off one nail at a time.',
      'On light nails stop before the pink quick; on dark nails stop when you see the pale dot in the center.',
      'Smooth the edges with a file or grinder when you finish.',
    ],
    cue: 'When in doubt take less. Several small trims beat one that hits the quick.',
    good: 'Nails just off the floor with smooth edges.',
    watch: 'Bleeding or a yelp: stop. This is a get-a-person moment.',
    ref: 'short smooth nails',
  },
  {
    t: 'Final check',
    quickRead: 'Walk around her once, check symmetry and stray hairs.',
    doNext: [
      'Comb the whole coat out one more time and look at her straight from the front.',
      'Check both sides match for length and shape, then tidy any stray or choppy bits.',
      'Feel over the easy-to-miss spots: armpits, sanitary, and between the toes.',
    ],
    cue: 'Step back and read the whole outline. Most misses show in the silhouette, not up close.',
    good: 'Balanced, clean and ready for the parent.',
    watch: "Don't over-fuss a tired dog, call it when she's done.",
    ref: 'finished groom, both sides',
  },
];
