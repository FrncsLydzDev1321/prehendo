import { describe, expect, it } from "vitest";
import { libraryCoach } from "@/lib/ai/coach";
import { retrieveCards } from "@/lib/knowledge/techniques";
import { rateLimit } from "@/lib/rate-limit";
import { scoreAnswer } from "@/lib/scoring";
import { getStarterCase } from "@/lib/starter-cases";

describe("library coach (fallback when AI is down)", () => {
  it("names missed clues and explains false flags", () => {
    const c = getStarterCase("starter-1a")!;
    const score = scoreAnswer({
      answerVerdict: c.verdict,
      answerTechniques: c.techniques,
      chosenVerdict: "fake",
      chosenClues: ["emotional_language", "fake_quote"],
    });
    const msg = libraryCoach(c, score);
    expect(msg).toContain("Fake Account");
    expect(msg).toContain("Fake Quote");
  });
});

describe("RAG retrieval", () => {
  it("returns one card per unique technique", () => {
    expect(retrieveCards(["fake_quote", "fake_quote", "fake_expert"]).map((c) => c.id)).toEqual(["fake_quote", "fake_expert"]);
  });
});

describe("rateLimit", () => {
  it("blocks after the limit within the window", () => {
    const key = `test-${Math.random()}`;
    expect(rateLimit(key, 2, 1000, 0)).toBe(true);
    expect(rateLimit(key, 2, 1000, 10)).toBe(true);
    expect(rateLimit(key, 2, 1000, 20)).toBe(false);
    expect(rateLimit(key, 2, 1000, 2000)).toBe(true);
  });
});
