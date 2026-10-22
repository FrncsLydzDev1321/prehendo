// Case generation pipeline:
//   blueprint (teacher) → writer (Gemma 4) → schema check (Zod)
//   → validator (GPT-OSS, a different model) → retry with feedback if needed
//   → saved as "pending" for the teacher to review (human-in-the-loop).
import {
  AIUnavailableError,
  chatJSON,
  validatorProviders,
  writerProviders,
} from "@/lib/ai/providers";
import { validatorMessages, writerMessages } from "@/lib/ai/prompts";
import { validatorOutputSchema, writerOutputSchema, type WriterOutput } from "@/lib/schemas";
import type { Blueprint, TechniqueId } from "@/lib/types";
import { TECHNIQUE_IDS } from "@/lib/types";

export interface ValidationReport {
  passed: boolean | null; // null = validator unavailable
  detected: TechniqueId[];
  missing: TechniqueId[];
  extra: TechniqueId[];
  issues: string[];
  attempts: number;
  writerModel: string;
  validatorModel: string | null;
}

export interface GeneratedCase {
  output: WriterOutput;
  validation: ValidationReport;
}

const MAX_ATTEMPTS = 2;

/** Pure comparison of planted vs detected techniques (unit-tested). */
export function compareTechniques(planted: readonly TechniqueId[], detectedRaw: readonly string[]) {
  const detected = detectedRaw.filter((d): d is TechniqueId =>
    (TECHNIQUE_IDS as readonly string[]).includes(d),
  );
  const missing = planted.filter((t) => !detected.includes(t));
  const extra = detected.filter((t) => !planted.includes(t));
  return { detected, missing, extra };
}

/** Deterministic checks that don't need AI. */
export function structuralIssues(bp: Blueprint, out: WriterOutput): string[] {
  const issues: string[] = [];
  if (bp.techniques.includes("old_photo_reused") && !out.content.photo) {
    issues.push("old_photo_reused needs a photo, but photo is null.");
  }
  for (const t of bp.techniques) {
    if (!out.clueNotes[t]) issues.push(`Missing clueNotes entry for ${t}.`);
  }
  return issues;
}

export async function generateCase(bp: Blueprint): Promise<GeneratedCase> {
  const writers = writerProviders();
  if (writers.length === 0) throw new AIUnavailableError(["No AI provider keys configured."]);

  let feedback: string[] | undefined;
  let last: GeneratedCase | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const { data, provider } = await chatJSON(writers, writerMessages(bp, feedback), writerOutputSchema, {
      temperature: 0.8,
      maxTokens: 2000,
      timeoutMs: 40_000,
    });

    // Keep only clue notes for planted techniques.
    const clueNotes: Record<string, string> = {};
    for (const t of bp.techniques) if (data.clueNotes[t]) clueNotes[t] = data.clueNotes[t];
    const output: WriterOutput = { ...data, clueNotes };

    const structural = structuralIssues(bp, output);

    let validation: ValidationReport;
    try {
      const v = await chatJSON(validatorProviders(), validatorMessages(output.content, output.evidence), validatorOutputSchema, {
        temperature: 0,
        maxTokens: 1200,
        timeoutMs: 25_000,
      });
      const cmp = compareTechniques(bp.techniques, v.data.detected);
      const issues = [...structural, ...v.data.issues];
      if (!v.data.ageAppropriate) issues.push("Validator: not age-appropriate.");
      if (!v.data.fictionalOnly) issues.push("Validator: may mention real people or events.");
      if (cmp.missing.length) issues.push(`Validator could not find: ${cmp.missing.join(", ")}.`);
      if (cmp.extra.length) issues.push(`Validator also found unplanned: ${cmp.extra.join(", ")}.`);
      validation = {
        passed:
          structural.length === 0 &&
          v.data.ageAppropriate &&
          v.data.fictionalOnly &&
          cmp.missing.length === 0 &&
          cmp.extra.length === 0,
        ...cmp,
        issues,
        attempts: attempt,
        writerModel: provider.model,
        validatorModel: v.provider.model,
      };
    } catch {
      // Validator down: don't block the teacher; flag for careful manual review.
      validation = {
        passed: structural.length === 0 ? null : false,
        detected: [],
        missing: [],
        extra: [],
        issues: [...structural, "Validator unavailable. Please review this case carefully."],
        attempts: attempt,
        writerModel: provider.model,
        validatorModel: null,
      };
    }

    last = { output, validation };
    if (validation.passed !== false) return last;
    feedback = validation.issues;
  }

  // Still failing after retries: return it anyway, clearly flagged, so the teacher decides.
  return last!;
}
