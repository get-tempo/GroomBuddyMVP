// Per-breed intake decision tree. Pre-made and static on purpose: the coat
// question only shows conditions that can actually happen to that breed's coat,
// and the style question only shows cuts a groomer would actually offer, so no
// model call is needed at intake time.
//
// Grounded in the school's curriculum (student manual):
// - The manual's matting doctrine ("humanity before vanity": painful matting
//   means a shave-down, not a style) is why the coat question comes BEFORE the
//   style question: condition gates the cut.
// - Mats form on long/curly/silky coats in compression zones (armpits, pants,
//   ears, collar line); double coats SHED instead, so shedding-coat breeds get
//   shedding questions, never a "matted to the skin" option.
// - The manual's coat taxonomy (Smooth, Short, Combination, Double, Heavy,
//   Silky, Natural Long, Curly/wavy, Wired, ...) drives the unknown-mix flow.
// - Style names are standard professional pet trims (the manual teaches prework
//   and coat care, not styling), with the school's head-shape doctrine kept
//   (round head on Shih Tzu, rectangle beard-and-brows on Schnauzer).

export type IntakeSet = {
  coatTitle: string;
  coats: string[];
  styleTitle: string;
  styles: string[];
};

// ---- shared sets ----

// Curly/wavy continuously-growing coats (doodles, Poodle, Bichon): the
// matting scale IS the coat question, because length is condition-gated.
const CURLY_COATS = ['Brushed out, no mats', 'A few tangles', 'Matted in spots', 'Matted to the skin'];

// Silky drop coats (Shih Tzu, Yorkie, Maltese): same matting logic, finer hair.
const DROP_COATS = ['Brushed out, no mats', 'A few tangles', 'Matted in spots', 'Matted to the skin'];

const DOODLE_SET: IntakeSet = {
  coatTitle: "How's the coat?",
  coats: CURLY_COATS,
  styleTitle: "The look they're going for",
  styles: ['Short & easy (kennel)', 'Medium teddy', 'Longer & fluffy', 'Lamb (fuller legs)'],
};

const DROP_SET: IntakeSet = {
  coatTitle: "How's the coat?",
  coats: DROP_COATS,
  styleTitle: "The look they're going for",
  styles: ['Puppy cut (short & simple)', 'Teddy bear', 'Short summer cut', 'Long coat & topknot'],
};

// Double/heavy shedding coats: never body-clipped; the service is bath,
// de-shed, and tidying the feathering. No matting scale, a shedding scale.
const DOUBLE_SET: IntakeSet = {
  coatTitle: "How's the shedding?",
  coats: ['Normal shedding', 'Blowing coat (heavy shed)', 'Tangles in the feathering', 'Matted feathering'],
  styleTitle: "What's on the menu?",
  styles: ['Bath, de-shed & full tidy', 'Bath & de-shed only', 'Quick neaten (feet, pants, ears)'],
};

// Smooth/short single coats (labs, pitties, beagles...): can't mat at all.
const SMOOTH_SET: IntakeSet = {
  coatTitle: "How's the coat & skin?",
  coats: ['All good', 'Shedding a lot', 'Skin looks irritated'],
  styleTitle: "What's on the menu?",
  styles: ['Bath & brush', 'Bath + de-shed', 'The full tidy (nails, ears, sanitary)'],
};

// Wire coats: body holds up, the furnishings (beard, legs, skirt) tangle.
const WIRE_SET: IntakeSet = {
  coatTitle: "How's the coat?",
  coats: ['No tangles', 'Beard & legs a bit tangled', 'Furnishings matted', 'Overgrown all over'],
  styleTitle: "The look they're going for",
  styles: ['Pattern clip (classic look)', 'Short all over', 'Just a tidy & neaten'],
};

// ---- per-breed map (keys = the breed chips) ----

export const BREED_INTAKE: Record<string, IntakeSet> = {
  Goldendoodle: DOODLE_SET,
  Labradoodle: DOODLE_SET,
  'Doodle mix': DOODLE_SET,
  Poodle: {
    coatTitle: "How's the coat?",
    coats: CURLY_COATS,
    styleTitle: "The look they're going for",
    styles: ['Short & easy (kennel)', 'Teddy bear', 'Lamb (fuller legs)', 'Clean face & feet'],
  },
  'Golden Retriever': DOUBLE_SET,
  'Shih Tzu': DROP_SET,
  Yorkie: DROP_SET,
  Maltese: DROP_SET,
  Bichon: {
    coatTitle: "How's the coat?",
    coats: CURLY_COATS,
    styleTitle: "The look they're going for",
    styles: ['Bichon round (classic)', 'Teddy bear', 'Short & easy', 'Puppy cut'],
  },
  Schnauzer: {
    coatTitle: "How's the coat?",
    coats: ['No tangles', 'Beard & legs a bit tangled', 'Furnishings matted', 'Overgrown all over'],
    styleTitle: "The look they're going for",
    styles: ['Schnauzer pattern (classic)', 'Short schnauzer', 'Teddy all over (soft look)'],
  },
  'Cocker Spaniel': {
    coatTitle: "How's the coat?",
    coats: ['Brushed out', 'Tangles in ears or skirt', 'Matted feathering', 'Matted to the skin'],
    styleTitle: "The look they're going for",
    styles: ['Cocker pattern (classic)', 'Summer cocker (short)', 'Teddy all over', 'Full coat, just tidied'],
  },
};

// ---- unknown mix fallback: coat-type first (the school's own taxonomy, ----
// ---- collapsed to the five kinds a student can identify on sight)      ----

export const COAT_TYPE_QUESTION = "What's the coat like?";
export const COAT_TYPES: { label: string; set: IntakeSet }[] = [
  { label: 'Curly or fluffy', set: DOODLE_SET },
  { label: 'Long & silky', set: DROP_SET },
  { label: 'Thick double coat (sheds)', set: DOUBLE_SET },
  { label: 'Short & smooth', set: SMOOTH_SET },
  { label: 'Wiry', set: WIRE_SET },
];

// ---- typed-mix resolver: common mixes and breeds → the right premade set ----
// Substring match on the student's typed text. No model call: a lookup table
// covers nearly all real answers instantly; anything unmatched falls back to
// the coat-type question above (the student can SEE the coat).

const SYNONYMS: Array<{ match: string[]; set: IntakeSet }> = [
  { match: ['doodle', 'poo', 'cavapoo', 'cockapoo', 'maltipoo', 'shihpoo', 'schnoodle', 'whoodle', 'cavoodle', 'bernedoodle', 'sheepadoodle', 'aussiedoodle', 'poodle'], set: DOODLE_SET },
  { match: ['morkie', 'havanese', 'lhasa', 'coton', 'shih', 'yorkie', 'yorkshire', 'maltese', 'papillon'], set: DROP_SET },
  { match: ['golden', 'husky', 'shepherd', 'shepard', 'pomeranian', 'samoyed', 'malamute', 'aussie', 'australian', 'corgi', 'collie', 'chow', 'newfoundland', 'bernese', 'pyrenees', 'akita', 'keeshond', 'sheltie'], set: DOUBLE_SET },
  { match: ['lab', 'pit', 'bully', 'beagle', 'boxer', 'frenchie', 'french bulldog', 'bulldog', 'dachshund', 'chihuahua', 'pug', 'boston', 'pointer', 'vizsla', 'weimaraner', 'dalmatian', 'rottweiler', 'doberman', 'great dane', 'mastiff'], set: SMOOTH_SET },
  { match: ['schnauzer', 'westie', 'west highland', 'scottie', 'scottish terrier', 'cairn', 'wire', 'jack russell', 'airedale', 'wheaten'], set: WIRE_SET },
  { match: ['cocker', 'spaniel', 'springer', 'setter', 'cavalier'], set: BREED_INTAKE['Cocker Spaniel'] },
];

export function resolveTypedBreed(typed: string): IntakeSet | null {
  const t = typed.trim().toLowerCase();
  if (t.length < 3) return null;
  for (const { match, set } of SYNONYMS) {
    if (match.some((m) => t.includes(m))) return set;
  }
  return null;
}
