// AI coach feedback (Gemma 4 + RAG), with a knowledge-base fallback.
import { coach, libraryCoach } from "@/lib/ai/coach";
import { caseById } from "@/lib/cases-repo";
import { fail, ok, readJson } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { answerRequestSchema, firstIssue } from "@/lib/schemas";
import { scoreAnswer } from "@/lib/scoring";

export const maxDuration = 60;

export async function POST(req: Request) {
  const parsed = answerRequestSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { caseId, verdict, clues } = parsed.data;

  const c = await caseById(caseId);
  if (!c) return fail("Case not found.", 404);

  const score = scoreAnswer({
    answerVerdict: c.verdict,
    answerTechniques: c.techniques,
    chosenVerdict: verdict,
    chosenClues: clues,
  });

  // Protect the free AI quota: after the limit, students still get library feedback.
  if (!rateLimit(`coach:${clientIp(req)}`, 40, 10 * 60_000)) {
    return ok({ message: libraryCoach(c, score), source: "library" });
  }
  return ok(await coach(c, { verdict, clues }, score));
}
