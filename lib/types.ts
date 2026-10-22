// Shared types for Prehendo.
// A "case" is one simulated post (social media or news) that students investigate.

export const VERDICTS = ["real", "fake", "misleading"] as const;
export type Verdict = (typeof VERDICTS)[number];

export const TECHNIQUE_IDS = [
  "fake_expert",
  "emotional_language",
  "old_photo_reused",
  "fake_account",
  "misleading_headline",
  "fake_quote",
] as const;
export type TechniqueId = (typeof TECHNIQUE_IDS)[number];

export const TOOL_IDS = ["account", "date", "source"] as const;
export type ToolId = (typeof TOOL_IDS)[number];

export type Difficulty = 1 | 2 | 3;

/** What the student sees: the post itself. */
export interface CaseContent {
  format: "social" | "news";
  platform: string; // fictional platform or outlet name
  accountName: string;
  accountHandle: string;
  postedAgo: string; // e.g. "2h", "Oct 21"
  headline: string;
  body: string;
  photo: { description: string; caption: string } | null;
  stats: { likes: number; shares: number; comments: number };
}

/** What each investigation tool reveals. */
export type Evidence = Record<ToolId, string>;

/** The blueprint is decided by the teacher (or our code), never by the AI. */
export interface Blueprint {
  verdict: Verdict;
  techniques: TechniqueId[];
  difficulty: Difficulty;
  topic: string;
  hint?: string;
}

/** Full case, including the answer key. Server-side only. */
export interface CaseRecord extends Blueprint {
  id: string;
  content: CaseContent;
  evidence: Evidence;
  explanation: string;
  clueNotes: Partial<Record<TechniqueId, string>>;
  source: "starter" | "teacher";
}

/** Safe version sent to students before they answer (no answer key). */
export interface PublicCase {
  id: string;
  difficulty: Difficulty;
  topic: string;
  content: CaseContent;
  evidence: Evidence;
}

export function toPublicCase(c: CaseRecord): PublicCase {
  return {
    id: c.id,
    difficulty: c.difficulty,
    topic: c.topic,
    content: c.content,
    evidence: c.evidence,
  };
}
