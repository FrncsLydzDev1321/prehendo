# 🔍 Prehendo

**Every post is a case. Crack it.**

Prehendo (Latin: *to grasp, to seize*) is a detective mini game that teaches junior high students (ages 13–16) to spot fake news. Students investigate simulated social media posts and news articles, use detective tools, flag the tricks they find, and call a verdict: **Real**, **Fake**, or **Misleading**. Teachers design new cases with **open-weight AI** and approve every one before students see it.

> Built for **Cebu Hacktoberfest 2026** (Open Source Project Competition).

---

## Why it matters

Teens see misinformation every day, but "just be careful online" doesn't build skills. Research on games like *Bad News* shows that practicing against **weakened, simulated misinformation** makes people better at resisting the real thing. Prehendo brings that idea to Filipino classrooms, with teachers in control.

## How it works

| Student 🕵️ (no login) | Teacher 📁 (registered) |
|---|---|
| Pick a nickname (no personal data) | Register / log in with username + password |
| Play 5 cases per round, 3 difficulty levels | Choose the **answer key**: verdict + tricks + difficulty + topic |
| Use 3 tools: Check the Account, Date, Source | **Gemma 4** writes a fictional case to match it |
| Tick red flags + choose a verdict | **GPT-OSS** double-checks the clues are really there |
| Get scored + coached by the AI "Chief" | **Review, edit, approve, or reject**: nothing reaches students without approval |
| Earn XP, ranks, and 6 badges | See plays and accuracy per case |

**The six tricks:** 🥼 Fake Expert · 😱 Emotional Bait · 📅 Old Photo, New Story · 🎭 Fake Account · 📰 Misleading Headline · 💬 Fake Quote

## Responsible AI design

- **Blueprint first.** The teacher decides the truth. The AI only writes the story, so the answer key never depends on an AI's opinion.
- **AI checks AI.** A different model family (GPT-OSS) validates what Gemma 4 wrote. Failed cases are retried, then flagged for the teacher.
- **Human-in-the-loop.** Every AI case is `pending` until a teacher approves it. The AI's report and the teacher's decision are both stored (audit trail).
- **Deterministic scoring.** Points come from code, not from AI judgment. It even detects lucky guesses (right verdict, wrong reasons).
- **RAG grounding.** Before writing or coaching, the app retrieves the matching *Technique Cards* (our knowledge base in `lib/knowledge/techniques.ts`) and gives them to the model, so it uses our definitions instead of its memory.
- **Fictional world.** All cases happen in the made-up city of **Puerto Liwanag**. No real people or events. No AI-generated photos: images are labeled placeholders.
- **Works without AI.** 15 human-written starter cases and a knowledge-base coach keep the game running if every AI provider is down.

## Why open-weight AI

- **Free for schools:** runs on free tiers, so public schools don't pay per student.
- **Students' answers stay off closed platforms:** a school could self-host the same open models (e.g. Gemma 4 with Ollama) with no code changes beyond a URL.
- **No lock-in:** every provider speaks the OpenAI-compatible API, so swapping is one environment variable.
- **Permissive licenses:** Gemma 4 and GPT-OSS are both Apache 2.0.

| Role | Model | License | Host |
|---|---|---|---|
| Case writer + coach | **Gemma 4 26B A4B** (`@cf/google/gemma-4-26b-a4b-it`) | Apache 2.0 | Cloudflare Workers AI |
| Validator | **GPT-OSS 20B** (`openai/gpt-oss-20b`) | Apache 2.0 | Groq |
| Backup writer | **GPT-OSS 120B** (`openai/gpt-oss-120b`) | Apache 2.0 | Groq |

## Architecture

```
Browser ──► Vercel (Next.js 16)
             ├─ proxy.ts ............ refreshes login, guards /teacher
             ├─ /api/auth ........... Supabase Auth (teachers only)
             ├─ /api/teacher ........ generate / review ──► Supabase (Row Level Security)
             │     └─ RAG cards ─► Gemma 4 (writer) ─► GPT-OSS (validator)
             └─ /api/play ........... cases / answer / coach ──► Supabase (server only)
                   └─ RAG cards ─► Gemma 4 (coach) ─► fallback: GPT-OSS ─► handbook text
```

**Stack:** Next.js 16 · TypeScript · Tailwind CSS 4 · Supabase (Auth, Postgres, RLS) · Zod · Vitest · GitHub Actions · Vercel. Built with **Kiro** (see `.kiro/steering` and `.kiro/specs`).

## Run it locally

Requirements: Node.js 20.9+ (tested on 24), a free Supabase project, and free Cloudflare + Groq API keys.

```bash
git clone https://github.com/<your-username>/prehendo.git
cd prehendo
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev                  # http://localhost:3000
```

> The student game works even with an empty `.env.local` (starter cases + handbook coach). Teacher features need Supabase.

### Supabase setup (once)
1. Create a project → **SQL Editor** → paste and run `supabase/migrations/0001_init.sql`.
2. **Authentication → Sign In / Providers → Email** → turn **off** "Confirm email" (teachers sign in with usernames).
3. **Project Settings → API Keys** → copy the URL, publishable key, and secret key into `.env.local`.

### Checks
```bash
npm run check   # lint + typecheck + unit tests
npm run build
```

## Deploy (Vercel)
1. Push to GitHub → Vercel → **Add New Project** → import the repo.
2. **Settings → Environment Variables**: add every variable from `.env.example`.
3. Deploy. Every push to `main` redeploys; CI runs lint, typecheck, tests, and build.

## Project structure
```
app/            pages + API routes (play, teacher, auth)
components/     PostCard and shared UI
lib/knowledge/  Technique Cards (RAG knowledge base)
lib/ai/         providers (fallback chain), prompts (harness), generate, coach
lib/            scoring, progress, starter cases, Supabase helpers, schemas
supabase/       SQL schema with RLS
tests/          Vitest unit tests
.kiro/          Kiro steering files and spec (requirements, design, tasks)
```

## Limitations
- AI-written cases can still contain mistakes, which is exactly why teachers review them.
- Rate limits are in-memory (per server instance), a soft protection for free quotas.
- Phase 1 has one shared pool of approved cases (no class codes yet).

## Roadmap (Phase 2)
Class codes · leaderboard and streaks · student "report this case" button · hint button · AI grading of written reasons · vector RAG with open-weight embeddings for an "Ask the Chief" chat.

## License
[MIT](LICENSE). Cases, characters, places, and platforms in this game are fictional.
