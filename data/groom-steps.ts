// The canonical full-groom sequence. Grooming is systematic: this order is the
// disciplined path to a consistent result.
//
// NOTE: `detail` is TEMP hard-coded content so the Guided flow is demoable
// without an API key. Once the model is wired in, the per-step detail should be
// generated/grounded instead of read from here. Voice = the instructor talking
// to a student at the table.
export type StepDetail = {
  read: string; // where you're at
  next: string; // do this next
  how: string; // the technique cue
  good: string; // looks good when
  watch: string; // heads up
};

export type GroomStep = {
  id: string;
  name: string;
  blurb: string;
  detail: StepDetail;
  image?: { url: string; caption: string };
};

export const GROOM_STEPS: GroomStep[] = [
  {
    id: 'check',
    name: 'Pre-groom check',
    blurb: "Let's look them over before anything starts.",
    detail: {
      read: "Before anything touches this dog, you and I are just gonna look them over.",
      next: 'Run your hands over the whole body. Feel for mats, lumps, scabs, sore spots, and watch how the dog is acting.',
      how: "Go slow, nose to tail. Part the coat in a few spots so you can actually see the skin. Make a mental note of anything that feels off.",
      good: "You know where the trouble spots are, and the dog's comfortable with you, before you've even started.",
      watch: "Find a lump, a wound, or a really nervous dog? Stop and grab your instructor. We don't push through that stuff.",
    },
  },
  {
    id: 'brush',
    name: 'Brush out & de-mat',
    blurb: 'Coat has to be tangle-free before it ever gets wet.',
    detail: {
      read: 'Okay, the coat needs to be tangle-free before a drop of water touches it.',
      next: 'Line-brush the whole coat down to the skin, then comb through to double-check.',
      how: "Slicker in one hand, hold the coat back with the other, brush small sections from the skin outward. The comb should glide. If it snags, go back over that spot.",
      good: 'A comb slides cleanly from skin to tip anywhere on the body.',
      watch: 'Water turns mats into cement, so never bathe a matted dog. Tight mats near the skin? Come get me before you cut anything.',
    },
  },
  {
    id: 'bath',
    name: 'Bath',
    blurb: 'Get them clean, all the way to the skin.',
    detail: {
      read: 'Now we get them properly clean, all the way down to the skin.',
      next: 'Wet them thoroughly, shampoo to the skin, rinse till the water runs clear, condition if the coat needs it.',
      how: 'Work the shampoo in with your fingertips, not just over the surface. Rinse way longer than you think you need to.',
      good: 'The coat squeaks a little, water runs clear, no soapy film left.',
      watch: 'Keep water and shampoo out of the eyes and ears, and keep the water warm, never hot.',
    },
  },
  {
    id: 'dry',
    name: 'Dry',
    blurb: "Drying is where we set the coat up for a clean finish.",
    detail: {
      read: "Drying isn't just drying, it's where we set up a clean finish.",
      next: 'High-velocity dry to blow out the loose coat and water, then fluff-dry it straight.',
      how: 'Keep the nozzle moving and follow the direction of the hair. Brush as you dry to straighten it out.',
      good: "Coat's dry right down to the skin and stands up straight, no damp spots hiding.",
      watch: "Never blast air at the face or into the ears. If the dog's getting panicky, ease off, their comfort comes first.",
    },
  },
  {
    id: 'nails',
    name: 'Nails',
    blurb: "Quick job. Let's just do it calm.",
    detail: {
      read: "Quick one, but it's the part most people get nervous about. We'll keep it calm.",
      next: 'Take a little off each nail, and don’t forget the dewclaws.',
      how: "Small amounts at a time. On light nails you can see the pink quick, stay ahead of it. On dark nails, tiny bits and watch the cut surface.",
      good: "Nails are up off the floor and you didn't catch a quick.",
      watch: "Keep styptic powder right next to you. If you do nick a quick, press powder on it and stay calm, it happens to every single one of us.",
    },
  },
  {
    id: 'ears',
    name: 'Ears',
    blurb: 'Quick check and a clean.',
    detail: {
      read: 'Just a quick check and clean here.',
      next: 'Wipe the ear out, check for gunk or a smell, and only pluck if your method calls for it.',
      how: 'Cleaner on a cotton pad, gently wipe what you can see and reach. Never jam anything down deep.',
      good: "Ears look clean and the dog isn't shaking their head.",
      watch: "Redness, dark buildup, or a bad smell can mean an infection. Flag it for me, don't try to treat it.",
    },
  },
  {
    id: 'sanitary',
    name: 'Sanitary trim',
    blurb: 'Tidy up the private areas, gently.',
    detail: {
      read: "Let's tidy up the sanitary areas, nice and gentle.",
      next: 'Clip the sanitary area and belly with a light touch.',
      how: 'Use a longer guard or careful scissor work. The skin is sensitive here, so go with the grain.',
      good: 'Clean and tidy, no razor burn or irritation.',
      watch: 'Sensitive skin, so take it slow and keep your blade from getting hot.',
    },
  },
  {
    id: 'feet',
    name: 'Feet & pads',
    blurb: 'Feet make or break how finished it looks.',
    detail: {
      read: 'Feet are small but they make or break how finished the whole groom looks.',
      next: 'Clear the hair between the pads, then shape the foot to the breed.',
      how: 'Pad hair comes off with a small blade or trimmer. Then scissor the foot to a neat round, or whatever the breed calls for.',
      good: "Clean pads, a tidy foot outline, and the dog isn't slipping around.",
      watch: 'Pads are soft, so keep the blade flat and gentle. Watch for hair matted up between the pads.',
    },
  },
  {
    id: 'face',
    name: 'Face',
    blurb: "The face is what everyone notices first.",
    detail: {
      read: "The face is the first thing anyone notices, so we set the head shape on purpose.",
      next: 'Decide the head shape for this breed, then work toward it.',
      how: "Round faces, scissor evenly off the nose so the outline stays circular. Longer terrier faces, keep the beard and brows forward to lengthen it.",
      good: 'The head reads as one clean shape, no flat spots or stray bits sticking out.',
      watch: 'Go slow around the eyes and mouth. Tiny snips, and keep checking from straight on.',
    },
    image: {
      url: '/reference/head-shape-round.png',
      caption: 'Round head: scissor evenly off the nose so the outline stays circular.',
    },
  },
  {
    id: 'body',
    name: 'Body',
    blurb: 'The main event, body to the length and style.',
    detail: {
      read: "Here's the main event, taking the body down to the length and style you're after.",
      next: 'Clip or scissor the body to the target length, blending into the legs and chest.',
      how: 'Work with the coat direction, long even strokes, keep your lines smooth. Blend the transitions so nothing looks choppy.',
      good: 'Even length all over, smooth blends, and the silhouette matches the goal.',
      watch: "Don't go shorter than the plan. You can always take more off, you can't put it back on.",
    },
  },
  {
    id: 'finish',
    name: 'Finish & final check',
    blurb: 'Where good becomes great.',
    detail: {
      read: "Almost there. This is where a good groom becomes a great one.",
      next: 'Walk around the whole dog, even up anything that’s off, and do a final safety check.',
      how: 'Stand back and look at the silhouette from a few angles. Tidy the stragglers, then recheck the face and feet.',
      good: 'Balanced from every side, clean lines, and a happy comfortable dog.',
      watch: 'Make sure nothing got missed, no nicks, no mats left, ears and nails done. Then go show them off.',
    },
  },
];
