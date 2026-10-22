import { describe, expect, it } from "vitest";
import { blueprintSchema, caseContentSchema, evidenceSchema } from "@/lib/schemas";
import { STARTER_CASES } from "@/lib/starter-cases";

describe("starter cases (the human-reviewed safety net)", () => {
  it("has 5 cases per level with unique ids", () => {
    for (const level of [1, 2, 3]) {
      expect(STARTER_CASES.filter((c) => c.difficulty === level)).toHaveLength(5);
    }
    expect(new Set(STARTER_CASES.map((c) => c.id)).size).toBe(STARTER_CASES.length);
  });

  it.each(STARTER_CASES.map((c) => [c.id, c] as const))("%s is a valid, consistent case", (_id, c) => {
    expect(blueprintSchema.safeParse(c).success).toBe(true);
    expect(caseContentSchema.safeParse(c.content).success).toBe(true);
    expect(evidenceSchema.safeParse(c.evidence).success).toBe(true);
    for (const t of c.techniques) expect(c.clueNotes[t]).toBeTruthy();
    if (c.techniques.includes("old_photo_reused")) expect(c.content.photo).not.toBeNull();
  });

  it("covers every verdict and every technique", () => {
    expect(new Set(STARTER_CASES.map((c) => c.verdict))).toEqual(new Set(["real", "fake", "misleading"]));
    expect(new Set(STARTER_CASES.flatMap((c) => c.techniques)).size).toBe(6);
  });
});
