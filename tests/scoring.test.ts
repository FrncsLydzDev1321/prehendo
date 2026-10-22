import { describe, expect, it } from "vitest";
import { maxPoints, scoreAnswer } from "@/lib/scoring";

describe("scoreAnswer", () => {
  it("cracks a case with the right verdict and every clue", () => {
    const r = scoreAnswer({
      answerVerdict: "fake",
      answerTechniques: ["fake_expert", "emotional_language"],
      chosenVerdict: "fake",
      chosenClues: ["emotional_language", "fake_expert"],
    });
    expect(r.grade).toBe("cracked");
    expect(r.points).toBe(maxPoints(2));
    expect(r.missed).toEqual([]);
  });

  it("flags a lucky guess: right verdict, no supporting clues", () => {
    const r = scoreAnswer({
      answerVerdict: "fake",
      answerTechniques: ["fake_expert", "emotional_language"],
      chosenVerdict: "fake",
      chosenClues: [],
    });
    expect(r.grade).toBe("lucky");
    expect(r.points).toBe(10);
  });

  it("rewards a clean read of a real post", () => {
    const r = scoreAnswer({ answerVerdict: "real", answerTechniques: [], chosenVerdict: "real", chosenClues: [] });
    expect(r.grade).toBe("cracked");
    expect(r.points).toBe(16);
  });

  it("penalises false red flags but never goes below zero", () => {
    const r = scoreAnswer({
      answerVerdict: "real",
      answerTechniques: [],
      chosenVerdict: "fake",
      chosenClues: ["fake_quote", "fake_account", "fake_expert"],
    });
    expect(r.falseFlags).toHaveLength(3);
    expect(r.points).toBe(0);
    expect(r.grade).toBe("cold");
  });

  it("gives partial credit for clues even with the wrong verdict", () => {
    const r = scoreAnswer({
      answerVerdict: "misleading",
      answerTechniques: ["old_photo_reused"],
      chosenVerdict: "fake",
      chosenClues: ["old_photo_reused"],
    });
    expect(r.grade).toBe("close");
    expect(r.points).toBe(4);
  });
});
