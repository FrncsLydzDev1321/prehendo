import { describe, expect, it } from "vitest";
import { compareTechniques, structuralIssues } from "@/lib/ai/generate";
import type { WriterOutput } from "@/lib/schemas";

describe("compareTechniques", () => {
  it("finds missing and extra techniques and ignores unknown ids", () => {
    const r = compareTechniques(["fake_expert", "fake_quote"], ["fake_expert", "emotional_language", "made_up"]);
    expect(r.missing).toEqual(["fake_quote"]);
    expect(r.extra).toEqual(["emotional_language"]);
    expect(r.detected).toEqual(["fake_expert", "emotional_language"]);
  });
});

describe("structuralIssues", () => {
  const base: WriterOutput = {
    content: {
      format: "social",
      platform: "Kwento",
      accountName: "Test",
      accountHandle: "@test",
      postedAgo: "1h",
      headline: "Hello world",
      body: "A body that is long enough to pass.",
      photo: null,
      stats: { likes: 1, shares: 1, comments: 1 },
    },
    evidence: { account: "account evidence", date: "date evidence", source: "source evidence" },
    explanation: "An explanation that is long enough.",
    clueNotes: {},
  };

  it("requires a photo for old_photo_reused and a clue note per technique", () => {
    const issues = structuralIssues(
      { verdict: "misleading", techniques: ["old_photo_reused"], difficulty: 1, topic: "Local events" },
      base,
    );
    expect(issues).toHaveLength(2);
  });

  it("passes a well-formed real case", () => {
    expect(structuralIssues({ verdict: "real", techniques: [], difficulty: 1, topic: "Local events" }, base)).toEqual([]);
  });
});
