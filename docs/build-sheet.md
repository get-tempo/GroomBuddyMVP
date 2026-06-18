# Grooming Buddy ICP 1: 2-Week MVP Build Sheet (Paid Pilot)

The goal is a working, phone-first app a real student cohort at LKNGA uses during
grooming, with real money changing hands by end of week 2. Not a scaled launch,
a paid pilot. Engineering is not the risk; content prep and scope discipline are.

## Definition of done (the pilot bar)

- A student can, on their phone mid-groom: ask a question and get a
  curriculum-grounded answer; send a photo and get directional coaching; be
  shown a reference image when it helps; and be kept safe by guardrails.
- It is deployed and in real daily use by a student cohort at LKNGA (free
  dogfood, no billing in the sprint).
- After ~a week of real deployment, a clear validation read: are students
  actually using it, are the answers and photo feedback good, what do the miss
  logs say. If it clears that bar, we have a concrete monetization path to pursue
  next (B2B to other grooming schools, or B2C to DIY owners), not money-in-hand
  during the sprint itself.

## Scope (locked)

**IN:** chat (text + photo), curriculum-grounded Q&A (RAG), directional photo
feedback framed as coaching, a small keyed reference image bank with the
ask-first + weak-match-show-nothing rules, safety guardrails, the v0 system
prompt.

**OUT (do not build for the pilot):** model routing / cost optimization,
fine-tuning, self-serve billing/subscriptions, embeddings if keyed lookup is
enough, ICP-2 / the equipment quiz, multi-school, admin dashboards, SMS / A2P.

## Channel decision: phone-first web app (PWA), NOT SMS, NOT the app store

Build a mobile-first web app (PWA) for the pilot. Not a texting bot, and not a
native App Store / Play Store app yet. Why:
- The reference image bank needs rich display and the ask-then-show UX, which is
  web-native and clumsy over MMS.
- It sidesteps A2P / carrier registration cost and delay (a known reason this
  build was chosen over the PMS/SMS ideas).
- Faster to build, richer UX, works on any student's phone via a link.

**Web vs app store (the friction question, answered):** a native store app has
MORE first-use friction (find, download, install, account) AND a review gate.
App Store review (~1-2 days, often longer) and Apple's habit of rejecting
"minimum functionality" / thin web-wrapper apps would poison a 2-week
rapid-iteration pilot, every fix waits on re-review. A PWA is the opposite: hand
the small known student cohort a link or QR at the salon, they tap and it opens
instantly, and "Add to Home Screen" gives them an app icon + fullscreen launch,
the native feel without the install friction or the store. We also ship fixes
instantly during the pilot, no re-review.

The $99/yr Apple fee is not the constraint; timing is. The store is a
post-validation distribution step. When we want it (push notifications, store
credibility, discoverability), the SAME PWA codebase wraps into native shells via
Capacitor / PWABuilder, so going web-first is not throwaway work. Push
notifications are the one real native edge; not needed for the pilot.

SMS is a later channel, not the MVP.

## Architecture (MVP, deliberately simple)

- **Frontend + backend:** Next.js (App Router) on Vercel, ONE codebase. The UI
  (chat, photo upload, image display) plus API routes that hold the keys, the
  system prompt, RAG retrieval, the image-bank lookup, and the model calls. One
  repo, one deploy, the right call for a solo builder.
- **Model:** ONE strong multimodal model (Claude or GPT-4-class) for both Q&A and
  photo feedback. No routing yet (cost is trivial at pilot scale).
- **RAG:** curriculum docs chunked into a vector store (start simple; a basic
  retrieval is fine for the pilot).
- **Image bank:** hosted images + JSON manifest + keyed lookup on breed/task
  tags, exposed as a tool the model calls. ~15-20 images for the pilot.
- **Auth:** light. A school access code or magic link, with a per-student record
  so we can attribute miss logs.
- **Logging:** store every turn and flag misses (could not answer, wanted an
  image and had none, safety stop). This is the iteration fuel and the moat seed.

## Two parallel tracks (run from day 1)

**A) Engineering (the technical builders):** app + backend + RAG + image lookup +
logging + auth.

**B) Content (you + the instructor):** clean the curriculum for RAG; build the
image manifest (tag + host 15-20 images); finalize the system prompt and the
safety rules; decide the pilot price. **This is the long pole. If you protect one
thing, protect this, and start it on day 1.**

## Day-by-day (10 working days)

**Week 1, build the loop**
- D1: kickoff, lock scope. Scaffold app + repo + backend skeleton. Get a
  text-only answer flowing end to end with the v0 prompt. START content prep.
- D2: photo upload + vision feedback flow. Ingest curriculum into RAG; first
  grounded answers working.
- D3: image bank, manifest for ~15 images, hosted, keyed lookup tool, ask-first +
  display UX.
- D4: safety guardrails + prompt tuning. Turn/miss logging. Light auth.
- D5: internal dogfood at the salon with 1-2 students. Collect misses, triage.

**Week 2, make it good and chargeable**
- D6-7: fix the top misses (RAG gaps, missing/wrong images, safety edges).
  Tighten surfacing rules and prompts.
- D8: onboarding polish. Make sure miss-logging + a simple "is this useful?"
  thumbs signal are captured (this is the validation data).
- D9: dry-run with a couple of students. Final fixes.
- D10: deploy to the full cohort (free). Start the ~1-week real-use validation
  window and the feedback + miss loop. Read it before deciding on selling.

## Monetization (deferred by design)

The sprint does NOT bolt on billing. Free dogfood at LKNGA first. If it reaches a
valid point after ~a week of real deployment, THEN pursue selling:
- **B2B:** license to other grooming schools (leans on the moat + school
  distribution). Note: selling to other schools later implies per-school
  curriculum grounding (multi-tenant), a post-validation architecture concern,
  NOT pilot scope. Keep the pilot single-tenant and LKNGA-grounded.
- **B2C:** DIY owners (see `diy-pricing-plan.md`).
The 2-week bar is a validated, in-use MVP plus an identified path, not revenue.

## Risks and mitigations

- **Content prep underestimated** (most likely failure, and content is confirmed
  PARTIAL). Start D1; founder + salon own it; cap the image bank at ~10-15.
- **Photo-feedback quality** (the quality risk). Frame as coaching, not grading;
  test on real grooms on D5, not D13.
- **Scope creep** toward routing / fine-tuning / ICP-2. The OUT list is law for
  these two weeks.

## Decisions (resolved)

1. **Build: SOLO** (founder). Salon helps on the content/materials track. Plan
   around one builder, guard scope even harder.
2. **Stack: Next.js (App Router) + Vercel**, plus Claude/GPT and a managed vector
   store. One codebase.
3. **Monetization: free dogfood at LKNGA first.** Pursue B2B (other schools) or
   B2C (DIY) only after a ~1-week validation read. No billing in the sprint.
4. **Content: PARTIAL.** Curriculum needs cleanup; images need gathering /
   tagging / hosting. Salon helps from D1. Cap the pilot image bank at ~10-15 so
   content does not blow the timeline.

## The IBM Bob option (parked, decide after the pilot)

Bob is an AI coding IDE, not a model lock-in. Confirmed against the Official Rules:
- A separate prior version does NOT break the rules. Sec 13 "original work" means
  your own work (not copied), not contest-period-only. Sec 10: you keep your IP.
  The rules do NOT require creation during the contest and do NOT ban pre-existing
  work. So a non-Bob production app + a Bob challenge version is allowed.
- Only firm requirement: "IBM Bob will be the core component of all project
  submissions." Other IBM tech (watsonx, Granite) is optional ("might be used").
- Practical caution: Bob must genuinely be central, not a token wrap, or it risks
  the "core component" requirement and the technical-execution/challenge-fit
  judging. Also requires completing an IBM SkillsBuild learning activity.
Eligible (founder is an enrolled student). Revisit once the pilot is live; if
entering, build the July version with Bob driving it, watsonx only to chase the
"Best Use of Technology" prize.
