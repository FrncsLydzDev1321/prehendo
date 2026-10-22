// Teacher picks a blueprint → open-weight AI writes the case → validator
// checks it → saved as "pending" until the teacher approves it.
import { AIUnavailableError } from "@/lib/ai/providers";
import { generateCase } from "@/lib/ai/generate";
import { fail, ok, readJson } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { blueprintSchema, firstIssue } from "@/lib/schemas";
import { currentTeacher, sessionClient } from "@/lib/supabase/server";

export const maxDuration = 120;

export async function POST(req: Request) {
  const teacher = await currentTeacher();
  if (!teacher) return fail("Please log in as a teacher.", 401);
  if (!rateLimit(`generate:${teacher.id}`, 20, 60 * 60_000)) {
    return fail("You've generated a lot of cases this hour. Take a short break and try again.", 429);
  }

  const parsed = blueprintSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const bp = parsed.data;

  try {
    const { output, validation } = await generateCase(bp);
    const supabase = await sessionClient();
    const { data, error } = await supabase
      .from("cases")
      .insert({
        created_by: teacher.id,
        status: "pending",
        verdict: bp.verdict,
        techniques: bp.techniques,
        difficulty: bp.difficulty,
        topic: bp.topic,
        content: output.content,
        evidence: output.evidence,
        explanation: output.explanation,
        clue_notes: output.clueNotes,
        validation,
        ai_model: validation.writerModel,
      })
      .select("id")
      .single();
    if (error) {
      console.error("[generate] insert failed:", error.message);
      return fail("The case was written but could not be saved. Did you run the database setup SQL?", 500);
    }
    return ok({ id: data.id });
  } catch (err) {
    if (err instanceof AIUnavailableError) {
      console.error("[generate]", err.attempts);
      return fail("The AI detectives are busy right now. Please try again in a minute.", 503);
    }
    console.error("[generate]", err);
    return fail("Something went wrong while writing the case.", 500);
  }
}
