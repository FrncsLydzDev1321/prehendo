// Students get a round of cases WITHOUT the answer key.
import { casesForRound } from "@/lib/cases-repo";
import { fail, ok } from "@/lib/http";
import type { Difficulty } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const level = Number(new URL(req.url).searchParams.get("level") ?? "1");
  if (![1, 2, 3].includes(level)) return fail("Level must be 1, 2, or 3.");
  const cases = await casesForRound(level as Difficulty, 5);
  return ok({ cases });
}
