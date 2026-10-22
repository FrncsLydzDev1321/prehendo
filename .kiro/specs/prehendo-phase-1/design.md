# Design: Prehendo Phase 1

## Architecture
```
Browser ──► Vercel (Next.js)
             ├─ proxy.ts ............ session refresh + teacher gate
             ├─ app/api/auth ........ Supabase Auth (username → hidden email)
             ├─ app/api/teacher ..... generate / review  ──► Supabase (RLS as teacher)
             │      └─ lib/ai/generate ─► Gemma 4 (Cloudflare) ─► GPT-OSS validator (Groq)
             └─ app/api/play ........ cases / answer / coach ──► Supabase (secret key, server only)
                    └─ lib/ai/coach ──► Gemma 4 (fallback: GPT-OSS → library text)
```

## Data model (Supabase)
- `profiles(id, full_name, username)`: created by trigger on sign-up.
- `cases(id, created_by, status, verdict, techniques[], difficulty, topic, content, evidence, explanation, clue_notes, validation, ai_model, reviewed_at)`.
- `attempts(case_id, nickname, verdict, clues[], correct, points)`: anonymous stats.
RLS: teachers CRUD their own cases and read attempts on them. No anonymous access.

## Generation pipeline
1. Teacher blueprint validated by `blueprintSchema`.
2. RAG: `retrieveCards(techniques)` → prompt context.
3. Writer (Gemma 4, temp 0.8) returns JSON → `extractJson` → `writerOutputSchema`.
4. Structural checks (photo for old_photo_reused, clue note per technique).
5. Validator (GPT-OSS 20B, temp 0) lists detected techniques + safety flags.
6. Pass if detected == planted and safe; otherwise retry once with feedback.
7. Insert as `pending` with the validation report (audit trail).

## Scoring
Verdict +10 · each clue found +4 · each false flag −2 · clean real read +6 · min 0.
Grades: cracked / solid / lucky / close / cold.

## Key decisions
- Blueprint-first: the answer key never comes from the AI.
- Two different model families: the writer doesn't grade its own work.
- Starter cases + library coach: the demo never depends on AI uptime.
- Photos are labeled placeholders, never generated images.
