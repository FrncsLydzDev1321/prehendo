# Project structure

- `app/` pages and API routes
  - `app/play/**` student lobby and game round (client components)
  - `app/teacher/**` teacher auth, HQ dashboard, case designer, case review
  - `app/api/play/**` public game API (cases, answer, coach)
  - `app/api/teacher/**` teacher-only API (generate, review/delete)
  - `app/api/auth/**` register, login, logout
- `components/` shared UI (`PostCard`, `ui.tsx`)
- `lib/` logic
  - `lib/knowledge/techniques.ts` RAG knowledge base (Technique Cards)
  - `lib/ai/` providers (fallback chain), prompts (harness), generate pipeline, coach
  - `lib/scoring.ts`, `lib/progress.ts` pure game logic (unit-tested)
  - `lib/starter-cases.ts` 15 human-written cases
  - `lib/supabase/server.ts` session + admin clients
- `supabase/migrations/` SQL schema with RLS policies
- `tests/` Vitest unit tests
