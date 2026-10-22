# Tech rules

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4. Request interception lives in
  `proxy.ts` (Next 16 renamed middleware to proxy).
- Supabase: Auth (teachers only), Postgres, Row Level Security on every table.
- AI providers are OpenAI-compatible and host OPEN-WEIGHT models only:
  - Writer + coach: Gemma 4 26B (`@cf/google/gemma-4-26b-a4b-it`) on Cloudflare Workers AI.
  - Validator + backup: GPT-OSS 20B/120B on Groq.
- AI calls happen ONLY in server code (`app/api/**`, `lib/ai/**`). Never expose keys;
  no env var starts with `NEXT_PUBLIC_`.
- Every AI response is parsed with `extractJson` and validated with Zod before use.
- Scoring is deterministic (`lib/scoring.ts`), never decided by AI.
- RAG: retrieve Technique Cards from `lib/knowledge/techniques.ts` by technique id and
  include them in writer/coach prompts.
- Students never query the database directly. Server routes hide the answer key until
  an answer is submitted.
- Always provide a non-AI fallback (starter cases, library coach) so the game works offline from AI.
- Run `npm run check` (lint + typecheck + tests) before committing.
