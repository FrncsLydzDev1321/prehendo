// Data access for cases: database (teacher-made) + built-in starter cases.
import "server-only";
import { adminClient } from "@/lib/supabase/server";
import { STARTER_CASES, getStarterCase } from "@/lib/starter-cases";
import type { CaseRecord, Difficulty, PublicCase, TechniqueId, Verdict } from "@/lib/types";
import { toPublicCase } from "@/lib/types";

export interface CaseRow {
  id: string;
  created_by: string;
  status: "pending" | "approved" | "rejected";
  verdict: Verdict;
  techniques: TechniqueId[];
  difficulty: Difficulty;
  topic: string;
  content: CaseRecord["content"];
  evidence: CaseRecord["evidence"];
  explanation: string;
  clue_notes: CaseRecord["clueNotes"];
  validation: unknown;
  ai_model: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export function rowToCase(r: CaseRow): CaseRecord {
  return {
    id: r.id,
    source: "teacher",
    verdict: r.verdict,
    techniques: r.techniques,
    difficulty: r.difficulty,
    topic: r.topic,
    content: r.content,
    evidence: r.evidence,
    explanation: r.explanation,
    clueNotes: r.clue_notes ?? {},
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick cases for a round: teacher-approved cases first, topped up with starter cases. */
export async function casesForRound(level: Difficulty, count = 5): Promise<PublicCase[]> {
  let teacherCases: CaseRecord[] = [];
  const db = adminClient();
  if (db) {
    const { data, error } = await db
      .from("cases")
      .select("*")
      .eq("status", "approved")
      .eq("difficulty", level)
      .order("reviewed_at", { ascending: false })
      .limit(50);
    if (error) console.error("[cases] load failed:", error.message);
    else teacherCases = (data as CaseRow[]).map(rowToCase);
  }

  const picked = shuffle(teacherCases).slice(0, count);
  const starters = shuffle(STARTER_CASES.filter((c) => c.difficulty === level));
  for (const s of starters) {
    if (picked.length >= count) break;
    picked.push(s);
  }
  return shuffle(picked).map(toPublicCase);
}

/** Full case including the answer key (server-side only). */
export async function caseById(id: string): Promise<CaseRecord | null> {
  const starter = getStarterCase(id);
  if (starter) return starter;
  if (!UUID.test(id)) return null;
  const db = adminClient();
  if (!db) return null;
  const { data } = await db.from("cases").select("*").eq("id", id).eq("status", "approved").maybeSingle();
  return data ? rowToCase(data as CaseRow) : null;
}

/** Best effort: log an anonymous attempt so teachers can see how their cases perform. */
export async function recordAttempt(a: {
  caseId: string;
  nickname: string;
  verdict: Verdict;
  clues: TechniqueId[];
  correct: boolean;
  points: number;
}): Promise<void> {
  if (!UUID.test(a.caseId)) return; // starter cases aren't in the database
  const db = adminClient();
  if (!db) return;
  const { error } = await db.from("attempts").insert({
    case_id: a.caseId,
    nickname: a.nickname,
    verdict: a.verdict,
    clues: a.clues,
    correct: a.correct,
    points: a.points,
  });
  if (error) console.error("[attempts] insert failed:", error.message);
}
