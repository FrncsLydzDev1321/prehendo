// ─────────────────────────────────────────────────────────────
// The AI "harness": the instructions that shape how the open-weight
// models behave. Each prompt gets RAG context (retrieved Technique Cards).
// ─────────────────────────────────────────────────────────────
import type { ChatMessage } from "@/lib/ai/providers";
import { TECHNIQUE_LIST, VERDICT_INFO, cardsAsContext, retrieveCards } from "@/lib/knowledge/techniques";
import type { ScoreResult } from "@/lib/scoring";
import type { Blueprint, CaseContent, CaseRecord, Evidence, TechniqueId, Verdict } from "@/lib/types";
import { TECHNIQUE_IDS } from "@/lib/types";

const WORLD_RULES = `
WORLD RULES (must follow):
- Everything happens in the FICTIONAL Philippine city of "Puerto Liwanag".
- Use only INVENTED people, schools, pages, brands, and organizations. Never use real people, real politicians, real celebrities, real companies, or real news events.
- Fictional platforms you may use: "Kwento" or "ChikaChat" (social media), or invent a news site name.
- Audience: students aged 13–16. Keep it age-appropriate: no violence, no sexual content, no hate, no real medical advice, no politics.
- Simple, clear English.`.trim();

// ── 1. Case writer ────────────────────────────────────────────
export function writerMessages(bp: Blueprint, feedback?: string[]): ChatMessage[] {
  const planted = retrieveCards(bp.techniques);
  const avoid = TECHNIQUE_IDS.filter((t) => !bp.techniques.includes(t));

  const system = `You write realistic practice cases for a media literacy game. Students investigate each post and decide if it is Real, Fake, or Misleading.
${WORLD_RULES}

Verdict meanings:
- real: ${VERDICT_INFO.real.meaning}
- fake: ${VERDICT_INFO.fake.meaning}
- misleading: ${VERDICT_INFO.misleading.meaning}

You will receive a BLUEPRINT. The verdict and techniques are already decided. Your only job is to write a post that matches it EXACTLY:
- Plant every listed technique clearly, at the requested difficulty.
- Do NOT include any technique that is not listed.
- For a "real" verdict: trustworthy account, calm tone, specific details, and evidence that checks out.
- Difficulty 1 = obvious clues. Difficulty 2 = moderate. Difficulty 3 = subtle: calm, professional tone; clues found mainly through the evidence.

Evidence: write what each investigation tool reveals:
- "account": who posted it (age of account, followers, official or not).
- "date": when the post and any photo really come from.
- "source": what official pages or other sources say.
If a technique is revealed by a tool, that tool's evidence must reveal it. Otherwise the tool shows normal, believable information.

Reply with ONLY a JSON object in this exact shape:
{
  "content": {
    "format": "social" | "news",
    "platform": string,
    "accountName": string,
    "accountHandle": string,
    "postedAgo": string,
    "headline": string,
    "body": string (40-120 words),
    "photo": { "description": string, "caption": string } | null,
    "stats": { "likes": number, "shares": number, "comments": number }
  },
  "evidence": { "account": string, "date": string, "source": string },
  "explanation": string (2-3 sentences for students: the verdict and why),
  "clueNotes": { "<technique id>": "where this clue appears in the case" }
}
If "old_photo_reused" is listed, "photo" must not be null.`;

  const user = `BLUEPRINT
${JSON.stringify(
  {
    verdict: bp.verdict,
    techniques: bp.techniques,
    difficulty: bp.difficulty,
    topic: bp.topic,
    teacherIdea: bp.hint || null,
  },
  null,
  2,
)}

TECHNIQUES TO PLANT (from our knowledge base):
${cardsAsContext(planted)}

TECHNIQUES THAT MUST NOT APPEAR: ${avoid.join(", ")}
${feedback?.length ? `\nYOUR PREVIOUS ATTEMPT WAS REJECTED. Fix these problems:\n- ${feedback.join("\n- ")}` : ""}`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

// ── 2. Validator (a second model checks the first) ────────────
export function validatorMessages(content: CaseContent, evidence: Evidence): ChatMessage[] {
  const catalog = TECHNIQUE_LIST.map((c) => `- ${c.id}: ${c.short}`).join("\n");
  const system = `You are a strict quality checker for a media literacy game for students aged 13–16.
Read the case and its evidence. Decide which misinformation techniques are CLEARLY present (in the post or revealed by the evidence).

Technique catalog:
${catalog}

Also check:
- ageAppropriate: suitable for ages 13–16 (no violence, sexual content, hate, real medical advice, or politics).
- fictionalOnly: uses only invented people and organizations (no real public figures, companies, or real news events). The city "Puerto Liwanag" and platforms "Kwento"/"ChikaChat" are fictional.

Reply with ONLY JSON:
{ "detected": [technique ids], "ageAppropriate": boolean, "fictionalOnly": boolean, "issues": [short strings] }`;

  return [
    { role: "system", content: system },
    { role: "user", content: JSON.stringify({ post: content, evidence }, null, 2) },
  ];
}

// ── 3. Coach ──────────────────────────────────────────────────
export function coachMessages(
  c: CaseRecord,
  chosen: { verdict: Verdict; clues: TechniqueId[] },
  score: ScoreResult,
): ChatMessage[] {
  const relevant = retrieveCards([...c.techniques, ...score.falseFlags]);
  const system = `You are "Chief", a warm, upbeat detective coach in a media literacy game for students aged 13–16.
The ANSWER KEY below was set by a teacher or the game designer. It is always correct. Never contradict it and never invent new facts.
Write 3-5 short sentences (max 90 words), friendly and specific:
1. React to the student's verdict.
2. Praise clues they truly found (name the exact detail).
3. For missed clues, point to WHERE to look and ask one guiding question from the knowledge base.
4. If they flagged a technique that was not there, gently explain why it does not apply.
Use plain words. No markdown headings. Use at most one emoji.
Reply with ONLY JSON: { "message": string }`;

  const user = `CASE
Headline: ${c.content.headline}
Post: ${c.content.body}
Evidence: ${JSON.stringify(c.evidence)}

ANSWER KEY
Verdict: ${c.verdict}
Techniques: ${c.techniques.join(", ") || "none"}
Where the clues are: ${JSON.stringify(c.clueNotes)}
Explanation: ${c.explanation}

STUDENT ANSWER
Verdict chosen: ${chosen.verdict} (${score.verdictCorrect ? "correct" : "incorrect"})
Clues found: ${score.found.join(", ") || "none"}
Clues missed: ${score.missed.join(", ") || "none"}
Flagged but not present: ${score.falseFlags.join(", ") || "none"}

KNOWLEDGE BASE (retrieved cards):
${cardsAsContext(relevant)}`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
