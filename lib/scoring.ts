// Deterministic scoring. The answer key comes from the blueprint,
// so scoring never depends on an AI's opinion.
import type { TechniqueId, Verdict } from "@/lib/types";

export const POINTS = {
  verdict: 10,
  clueFound: 4,
  falseFlag: -2,
  cleanRead: 6, // correct "Real" verdict with no false red flags
} as const;

export type Grade = "cracked" | "solid" | "lucky" | "close" | "cold";

export interface ScoreResult {
  verdictCorrect: boolean;
  found: TechniqueId[];
  missed: TechniqueId[];
  falseFlags: TechniqueId[];
  points: number;
  grade: Grade;
}

export const GRADE_INFO: Record<Grade, { title: string; line: string }> = {
  cracked: { title: "Case cracked!", line: "Right verdict and every clue spotted. Sharp work, detective." },
  solid: { title: "Solid work", line: "Right verdict, and you found most of the evidence." },
  lucky: { title: "Lucky guess?", line: "Right verdict, but the clues that prove it slipped past you." },
  close: { title: "On the right track", line: "Wrong verdict, but you spotted real clues." },
  cold: { title: "The case went cold", line: "Not this time. Review the evidence and try the next one." },
};

export function scoreAnswer(input: {
  answerVerdict: Verdict;
  answerTechniques: readonly TechniqueId[];
  chosenVerdict: Verdict;
  chosenClues: readonly TechniqueId[];
}): ScoreResult {
  const planted = new Set(input.answerTechniques);
  const chosen = new Set(input.chosenClues);

  const verdictCorrect = input.chosenVerdict === input.answerVerdict;
  const found = [...planted].filter((t) => chosen.has(t));
  const missed = [...planted].filter((t) => !chosen.has(t));
  const falseFlags = [...chosen].filter((t) => !planted.has(t));

  let points = 0;
  if (verdictCorrect) points += POINTS.verdict;
  points += found.length * POINTS.clueFound;
  points += falseFlags.length * POINTS.falseFlag;
  if (verdictCorrect && planted.size === 0 && falseFlags.length === 0) points += POINTS.cleanRead;
  points = Math.max(0, points);

  // How much of the evidence did the student really find?
  const ratio =
    planted.size === 0 ? (falseFlags.length === 0 ? 1 : 0) : found.length / planted.size;

  let grade: Grade;
  if (verdictCorrect && ratio === 1 && falseFlags.length === 0) grade = "cracked";
  else if (verdictCorrect && ratio >= 0.5) grade = "solid";
  else if (verdictCorrect) grade = "lucky";
  else if (found.length > 0) grade = "close";
  else grade = "cold";

  return { verdictCorrect, found, missed, falseFlags, points, grade };
}

export function maxPoints(techniqueCount: number): number {
  return techniqueCount === 0
    ? POINTS.verdict + POINTS.cleanRead
    : POINTS.verdict + techniqueCount * POINTS.clueFound;
}
