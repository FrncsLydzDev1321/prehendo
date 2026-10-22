// Score a student's answer against the blueprint (deterministic, no AI),
// then reveal the answer key.
import { caseById, recordAttempt } from "@/lib/cases-repo";
import { fail, ok, readJson } from "@/lib/http";
import { answerRequestSchema, firstIssue } from "@/lib/schemas";
import { scoreAnswer } from "@/lib/scoring";

export async function POST(req: Request) {
  const parsed = answerRequestSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { caseId, verdict, clues, nickname } = parsed.data;

  const c = await caseById(caseId);
  if (!c) return fail("Case not found.", 404);

  const score = scoreAnswer({
    answerVerdict: c.verdict,
    answerTechniques: c.techniques,
    chosenVerdict: verdict,
    chosenClues: clues,
  });

  await recordAttempt({ caseId, nickname, verdict, clues, correct: score.verdictCorrect, points: score.points });

  return ok({
    score,
    answer: {
      verdict: c.verdict,
      techniques: c.techniques,
      clueNotes: c.clueNotes,
      explanation: c.explanation,
    },
  });
}
