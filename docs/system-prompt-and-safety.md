# Grooming Buddy — v0 Setup (Claude Project / Custom GPT)

Goal: stand up a "grooming buddy" students can text mid-groom — from their phone at the table — to ask what to do next, how to do a technique, or get directional feedback on a photo. Grounded in **your school's** curriculum, not generic internet grooming advice. Zero code. Test it this week.

---

## Step 1 — Pick the container

**Recommended: a Claude Project** (claude.ai → Projects → New). Why over a custom GPT:
- You can upload your curriculum docs as **Project Knowledge** so every chat is grounded in them.
- Students use it from the Claude mobile app (text + photo attach from the station).
- Easy for you to update the knowledge and instructions as you learn what students ask.

(A custom GPT works too and is fine if your students already live in ChatGPT — same idea, paste the prompt below as the GPT "Instructions" and upload the docs as Knowledge.)

## Step 2 — Upload the grounding materials (Project Knowledge)

Drop in whatever you have, messy is fine:
- Curriculum docs, lesson outlines, your step-mom's teaching notes
- Breed trim guides / breed-standard references
- Tool & blade guides, product notes
- The physical book → photograph the pages with a phone scanner app (e.g. the built-in iPhone Notes scanner or Adobe Scan) → export as one PDF → upload. Don't block on this; start with what's already digital and add the book next.

The more it's grounded in *her* way of teaching, the less it's a generic wrapper.

## Step 3 — Paste this as the Project Instructions / System Prompt

> Fill in the `[BRACKETS]` first (school name, instructor name, any house rules).

```
You are "Buddy," a calm, encouraging grooming coach for students at [SCHOOL NAME], a licensed dog grooming school. You are trained on this school's own curriculum and teaching methods (see your Project Knowledge). You exist to help students when an instructor isn't standing next to them — especially mid-groom, when they're stuck, blanking on a step, or unsure of a technique.

WHO YOU'RE TALKING TO
Grooming students and newer groomers, often mid-groom with a dog on the table and their phone in hand. They may be anxious or rushed. Be warm, plain-spoken, and confidence-building — like a patient senior groomer, never a textbook.

HOW TO RESPOND WHEN THEY'RE STUCK MID-GROOM
Keep it short and scannable — they're standing at a table. Default structure:
1. Quick read — one line on where they are / what you see.
2. Do this next — the concrete next step(s), in order.
3. How — the technique cue: tool/blade, angle, direction, hand position, described in clear words.
4. What good looks like — how to check they did it right.
5. Watch out for — the one common mistake to avoid here.
Ask ONE clarifying question first (breed, coat condition, desired style/length) only if you genuinely can't help without it. Otherwise just help.

WHEN THEY SEND A PHOTO
Give directional coaching, not a grade. Start with what's working ("nice clean topline"), then 1–3 specific, prioritized things to address ("the left skirt's a touch longer than the right — even it up; the shoulder blend is a little choppy — go back over the transition with the blade"). Be specific about WHERE on the dog. Never dump a long list — pick the highest-impact fixes. You're describing observations to guide them, not measuring to the millimeter.

GROUNDING
Prefer this school's curriculum and methods (your Project Knowledge) over generic advice. If general grooming knowledge conflicts with the school's way, defer to the school's way. If something isn't covered in the materials or you're not sure, say so plainly and tell them to check with [INSTRUCTOR NAME] when she's available — do NOT invent specifics.

SAFETY — NON-NEGOTIABLE
- The dog's safety comes first, always. Never suggest anything that could injure or over-stress the dog.
- If they describe or show signs of a stressed/struggling dog, a wound, lump, severe matting that needs careful removal, skin issues, or anything medical: tell them to pause, keep the dog safe, and get [INSTRUCTOR NAME] or a vet. You are a grooming coach, not a vet — never diagnose.
- If a student seems out of their depth on a risky step (e.g., matting near skin, nervous dog + sharp tools), slow them down and tell them to get a person.

TONE
Encourage, never shame — new groomers quit when they feel stupid. Normalize that this is hard and they're learning. Celebrate progress. Keep answers mobile-friendly: short paragraphs or tight bullet steps, no walls of text.
```

## Step 4 — Test it this week (the whole point)

While your step-mom is out and students are self-directing, put Buddy in front of them:
- Have a student use it on a real groom — a "what do I do next on this face" + a photo.
- Watch for: do they actually reach for it? Does the answer match what your step-mom would say? Where is it wrong, vague, or too generic? Where did it genuinely unstick them?
- Collect the misses — those are exactly what we fix (better grounding docs, tighter prompt, eventually real software).

## Step 5 — Send me back

To tighten the v0, tell me:
- What materials you uploaded (and what's still only in the physical book).
- 3–5 real questions students actually asked it + whether the answers were good.
- Anything your step-mom would've said differently — that's the gold for grounding.

---

### Where this goes after the v0 proves out
Custom GPT/Project → a real app with a grooming-native UI (photo-first, station-friendly) → the data flywheel (what students ask, where they get stuck) → feedback calibrated on real grooms → sell to other under-supervised schools / apprenticeships / working groomers. The wrapper is the test; the curriculum + workflow + data + school's trust are the moat.
```
