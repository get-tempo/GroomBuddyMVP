// Single source of truth for the LLM the API routes call.
//
// Per the build sheet (one strong multimodal model, no routing yet), both
// /api/ask and /api/chat use the SAME model. They import MODEL from here, so
// switching providers/models is this one file, not every call site.
//
// Delegation goes through OpenRouter: it holds the key and routes to the
// underlying model. The call sites (generateText / streamText) are unchanged.
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// OPENROUTER_API_KEY is read automatically; passed explicitly here so a missing
// key fails loudly at startup rather than on the first request.
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// OpenRouter uses prefixed slugs (e.g. "anthropic/claude-sonnet-4.5"), NOT the
// bare Anthropic IDs. Override via OPENROUTER_MODEL to pin a different slug
// without a code change — verify the exact slug at https://openrouter.ai/models.
const MODEL_SLUG = process.env.OPENROUTER_MODEL ?? 'anthropic/claude-sonnet-4.5';

export const MODEL = openrouter(MODEL_SLUG);
