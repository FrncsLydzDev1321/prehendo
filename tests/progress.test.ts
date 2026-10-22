import { describe, expect, it } from "vitest";
import { EMPTY_PROGRESS, applyResult, isLevelUnlocked, rankFor } from "@/lib/progress";
import { scoreAnswer } from "@/lib/scoring";

describe("progress", () => {
  it("awards a badge after spotting the same trick 3 times", () => {
    const score = scoreAnswer({
      answerVerdict: "fake",
      answerTechniques: ["fake_quote"],
      chosenVerdict: "fake",
      chosenClues: ["fake_quote"],
    });
    let p = { ...EMPTY_PROGRESS, nickname: "Agent" };
    const earned: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = applyResult(p, score);
      p = r.progress;
      earned.push(...r.newBadges);
    }
    expect(earned).toEqual(["fake_quote"]);
    expect(p.casesCracked).toBe(3);
    expect(p.xp).toBe(42);
  });

  it("ranks and unlocks levels by XP", () => {
    expect(rankFor(0).current.name).toBe("Rookie");
    expect(rankFor(200).current.name).toBe("Inspector");
    expect(isLevelUnlocked(2, 59)).toBe(false);
    expect(isLevelUnlocked(2, 60)).toBe(true);
  });
});
