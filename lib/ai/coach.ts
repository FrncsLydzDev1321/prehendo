// AI coach with a non-AI fallback built from the knowledge base,
// so students always get feedback even if every AI provider is down.
import { chatJSON, coachProviders } from "@/lib/ai/providers";
import { coachMessages } from "@/lib/ai/prompts";
import { TECHNIQUES, VERDICT_INFO } from "@/lib/knowledge/techniques";
import { coachOutputSchema } from "@/lib/schemas";
import type { ScoreResult } from "@/lib/scoring";
import type { CaseRecord, TechniqueId, Verdict } from "@/lib/types";

export interface CoachReply {
  message: string;
  source: "ai" | "library";
  model?: string;
}

export function libraryCoach(c: CaseRecord, score: ScoreResult): string {
  const parts: string[] = [];
  parts.push(
    score.verdictCorrect
      ? `Nice call: this case is ${VERDICT_INFO[c.verdict].label.toUpperCase()}.`
      : `This one is actually ${VERDICT_INFO[c.verdict].label.toUpperCase()}. ${VERDICT_INFO[c.verdict].meaning}`,
  );
  if (score.found.length) {
    parts.push(`You spotted: ${score.found.map((t) => TECHNIQUES[t].name).join(", ")}. 🔍`);
  }
  for (const t of score.missed.slice(0, 2)) {
    parts.push(`Missed clue, ${TECHNIQUES[t].name}: ${c.clueNotes[t] ?? TECHNIQUES[t].short} Ask yourself: ${TECHNIQUES[t].coachQuestion}`);
  }
  if (score.falseFlags.length) {
    parts.push(
      `${score.falseFlags.map((t) => TECHNIQUES[t].name).join(", ")} ${score.falseFlags.length === 1 ? "wasn't" : "weren't"} in this case. Only flag what the evidence shows.`,
    );
  }
  if (c.verdict === "real" && score.verdictCorrect && score.falseFlags.length === 0) {
    parts.push("Remember: surprising or alarming doesn't automatically mean fake.");
  }
  return parts.join(" ");
}

export async function coach(
  c: CaseRecord,
  chosen: { verdict: Verdict; clues: TechniqueId[] },
  score: ScoreResult,
): Promise<CoachReply> {
  const providers = coachProviders();
  if (providers.length > 0) {
    try {
      const { data, provider } = await chatJSON(providers, coachMessages(c, chosen, score), coachOutputSchema, {
        temperature: 0.5,
        maxTokens: 700,
        timeoutMs: 20_000,
      });
      return { message: data.message, source: "ai", model: provider.model };
    } catch {
      // fall through to the library
    }
  }
  return { message: libraryCoach(c, score), source: "library" };
}
