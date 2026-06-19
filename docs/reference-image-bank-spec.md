# Grooming Buddy: Reference Image Bank (build sheet)

The reference-image feature is a core value prop, not a nice-to-have. With 20+
images and growing, the bank must be a **searchable index**, not a list of
filenames in the prompt. Quality of the feature = quality of the per-image
metadata + the surfacing rules. Both are filled in by a groomer (instructor),
not by an engineer.

## Architecture (React app + OpenAI API)

The prototype is a React app talking to the OpenAI API (not the ChatGPT custom
GPT, which can't be embedded). The image flow:

1. Student sends a message.
2. The model decides a visual would help and calls the `find_reference_images`
   tool with a plain-language query.
3. Our backend searches the image manifest and returns the top 2-3 matches
   (url + caption + score).
4. React renders the image(s); the model references them in its text answer.

The model never sees all 20+ images. It only ever sees the handful the search
returns. That is what makes this scale to 50, 100, 500 images.

## 1. The image manifest (the heart of it)

One record per image. Hosted as JSON our backend can search. Example:

```json
{
  "id": "head-shape-round",
  "url": "https://cdn.groombuddy.com/ref/head-shape-round.png",
  "title": "Round head shape (Shih Tzu)",
  "description": "Short-muzzled dog whose head reads as a circle from the front. Red overlay circles show the round outer outline and the smaller muzzle circle.",
  "teaching_point": "Scissor evenly in every direction off the nose as the center point so the outline stays perfectly round, no flat spots.",
  "topics": ["head shapes", "round head", "face scissoring"],
  "breeds": ["Shih Tzu"],
  "skill_stage": "beginner",
  "when_to_show": "Student is identifying or scissoring a round head shape, comparing head shapes, or asks what a round head looks like.",
  "caption": "Round head shape: scissor evenly off the nose so the outline stays circular.",
  "tags": ["head-shape", "visual-reference"]
}
```

The fields that carry the teaching judgment are `description`, `teaching_point`,
`when_to_show`, and `caption`. These are where the instructor's expertise gets
encoded. Write them carefully. This is also early structured proprietary
grooming data, the same kind of labeled knowledge that feeds the longer-term
CV / quality-scoring moat.

## 2. The retrieval tool (function calling)

```json
{
  "name": "find_reference_images",
  "description": "Search the visual reference bank for images that would help the student understand a grooming concept. Call this whenever seeing a picture would aid understanding more than words alone.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "The concept or thing the student needs to see, in plain language (e.g. 'what a round head shape looks like')." },
      "max_results": { "type": "integer", "default": 3 }
    },
    "required": ["query"]
  }
}
```

Returns: `[{ id, url, title, caption, teaching_point, score }]` sorted by score.

## 3. Search: start simple, upgrade when it misses

- **v0 (ship first):** keyword / tag match against `topics` + `tags` + `title`.
  Fine for 20-50 images. No vector infra needed.
- **v1 (when fuzzy queries miss):** embed each image's `title + description +
  topics` into a vector store; the tool does semantic search. Handles loose
  student phrasing like "the dog's face looks like a box" -> rectangle head.
- Either way the tool returns a **score**; the surfacing rules use it as a gate.

## 4. Surfacing rules (system-prompt policy)

```
You have a visual reference bank, searchable via find_reference_images.

WHEN to show a visual:
- The student is identifying or comparing visual forms (head shapes, coat
  types, patterns, finished styles, before/after).
- The student asks to see something, or a words-only answer would be ambiguous.
- A picture would shorten the path to understanding.

HOW to show it:
- Call find_reference_images with a plain-language query.
- Show at most 1-2 images per answer (more only when explicitly comparing).
- If the top match's score is below the confidence threshold, do NOT show an
  image; say a visual isn't on file yet and describe it in words instead.
  (Never show a near-miss image, a wrong dog is worse than no dog.)
- Always pair an image with its caption and the one-line teaching point.
```

## 5. Build order

1. Gather the 20+ images, host them, give each a stable `id` filename.
2. Write the manifest, one record per image. **Do this with the instructor.**
   This is the real work and the real moat.
3. Build the v0 tag-match tool + render images in the React UI.
4. Test with real students. **Log every miss:** times it should have shown an
   image and didn't, or showed the wrong one.
5. Use the misses to (a) fix metadata and (b) decide when to upgrade to v1
   embeddings.
6. Tune the surfacing rules from real transcripts.

The miss log is itself valuable: each "should have shown X" is a labeled signal
that improves both the bank and the eventual quality-scoring model.

## 6. Model routing & cost (right model for the right task)

Core insight: the reference-image feature is nearly free to run (static images on
a CDN, never through the model, text-only lookup). The real cost drivers are
(1) vision input when a student sends a photo for feedback, (2) frontier output
tokens, (3) context size per turn. Design to minimize how often the expensive
vision model fires.

Since the student states **breed + what they're working on**, the index keys are
structured, so a plain keyed lookup on `(breed_group, task)` is usually enough.
Semantic/embedding search is a later upgrade, probably not needed.

| Task | Frequency | Model tier | Notes |
|---|---|---|---|
| Intent + breed/task extraction (router) | every turn | cheap small model | one call returns `{intent, breed, task, wants_image}`; classic classification |
| "Warrants a reference?" | every turn | mostly no model | index lookup + confidence threshold; hit + high score -> offer |
| Curriculum Q&A | common | mid-tier + RAG | reasoning + curriculum, no vision |
| Directional photo feedback | occasional, high value | frontier vision | the expensive turn; gate behind photo + feedback intent |
| Serve reference image | on accept | no model, CDN | static file |

**Pattern:** a cheap classifier runs first on every turn and routes to the right
(possibly expensive) model only when needed. Most turns resolve cheaply; the
frontier vision model fires only on real photo-feedback moments.

**Cost levers:**
- Tier models (above). Don't use the frontier model for routing or text Q&A.
- Prompt-cache the curriculum grounding (identical every call) for a steep discount.
- Only send a photo to the model on feedback-intent turns; gate vision.
- "Ask before showing" a reference also defers any work until the student opts in.

**On training a vertical model to cut costs (be honest):**
- You don't remove compute cost, you relocate API fees to GPU hosting + MLOps.
  Only wins at high steady volume.
- Fine-tuning shapes behavior/format, NOT reliable knowledge. Keep curriculum in
  RAG so it's updatable without retraining.
- Vision (photo feedback) is where frontier models lead most and a self-trained
  model lags hardest. Worst place to trade quality for cost.
- Where training DOES pay: the cheap, narrow, high-volume **router/classifier**
  (intent + breed/task). Start with prompted API calls; graduate to a fine-tuned
  self-hosted small model only when volume justifies the GPU bill.
- The durable asset is the dataset (manifest metadata + miss logs + graded
  grooms), which improves RAG now and could train a differentiated model later.
  Treat training as a quality play, not cost elimination.
