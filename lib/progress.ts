// Student progress lives in the browser (localStorage): no accounts and
// no personal data for minors. Pure functions are unit-tested.
import type { ScoreResult } from "@/lib/scoring";
import type { Difficulty, TechniqueId } from "@/lib/types";

export interface Progress {
  nickname: string;
  xp: number;
  casesPlayed: number;
  casesCracked: number;
  techniqueHits: Partial<Record<TechniqueId, number>>;
  badges: TechniqueId[];
  bestRound: number;
}

export const EMPTY_PROGRESS: Progress = {
  nickname: "",
  xp: 0,
  casesPlayed: 0,
  casesCracked: 0,
  techniqueHits: {},
  badges: [],
  bestRound: 0,
};

export const BADGE_THRESHOLD = 3;

export const RANKS = [
  { name: "Rookie", minXp: 0 },
  { name: "Junior Sleuth", minXp: 60 },
  { name: "Inspector", minXp: 180 },
  { name: "Chief Detective", minXp: 400 },
] as const;

export const LEVEL_UNLOCK_XP: Record<Difficulty, number> = { 1: 0, 2: 60, 3: 180 };

export function rankFor(xp: number) {
  let current: (typeof RANKS)[number] = RANKS[0];
  for (const r of RANKS) if (xp >= r.minXp) current = r;
  const next = RANKS.find((r) => r.minXp > xp) ?? null;
  return { current, next };
}

export function isLevelUnlocked(level: Difficulty, xp: number): boolean {
  return xp >= LEVEL_UNLOCK_XP[level];
}

/** Apply one answered case. Returns the new progress and any badges just earned. */
export function applyResult(p: Progress, score: ScoreResult): { progress: Progress; newBadges: TechniqueId[] } {
  const techniqueHits = { ...p.techniqueHits };
  for (const t of score.found) techniqueHits[t] = (techniqueHits[t] ?? 0) + 1;

  const newBadges = (Object.keys(techniqueHits) as TechniqueId[]).filter(
    (t) => (techniqueHits[t] ?? 0) >= BADGE_THRESHOLD && !p.badges.includes(t),
  );

  return {
    progress: {
      ...p,
      xp: p.xp + score.points,
      casesPlayed: p.casesPlayed + 1,
      casesCracked: p.casesCracked + (score.grade === "cracked" ? 1 : 0),
      techniqueHits,
      badges: [...p.badges, ...newBadges],
    },
    newBadges,
  };
}

const KEY = "prehendo.progress.v1";

export function loadProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_PROGRESS };
    return { ...EMPTY_PROGRESS, ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function saveProgress(p: Progress): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Private mode or storage blocked: the game still works for this session.
  }
}
