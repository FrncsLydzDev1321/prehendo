import { describe, expect, it } from "vitest";
import { extractJson } from "@/lib/ai/json";

describe("extractJson", () => {
  it("parses plain JSON", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });
  it("parses fenced JSON", () => {
    expect(extractJson('Here you go:\n```json\n{"a": "b"}\n```')).toEqual({ a: "b" });
  });
  it("ignores reasoning text before the object and braces inside strings", () => {
    const reply = 'Thinking about {format}... done.\n{"message": "Use {curly} braces", "n": 2}';
    expect(extractJson(reply)).toEqual({ message: "Use {curly} braces", n: 2 });
  });
  it("throws when there is no JSON", () => {
    expect(() => extractJson("no json here")).toThrow();
  });
});
