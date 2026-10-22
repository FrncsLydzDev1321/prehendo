// Human-in-the-loop: the teacher approves, edits, rejects, or deletes a case.
// Row Level Security guarantees a teacher can only touch their own cases.
import { fail, ok, readJson } from "@/lib/http";
import { firstIssue, reviewRequestSchema } from "@/lib/schemas";
import { currentTeacher, sessionClient } from "@/lib/supabase/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const teacher = await currentTeacher();
  if (!teacher) return fail("Please log in as a teacher.", 401);

  const parsed = reviewRequestSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { action, edits } = parsed.data;

  const supabase = await sessionClient();
  const { data: existing, error: loadError } = await supabase
    .from("cases")
    .select("content")
    .eq("id", id)
    .maybeSingle();
  if (loadError || !existing) return fail("Case not found.", 404);

  const update: Record<string, unknown> = {
    status: action === "approve" ? "approved" : action === "reject" ? "rejected" : "pending",
    reviewed_at: action === "unpublish" ? null : new Date().toISOString(),
  };
  if (edits) {
    update.content = { ...(existing.content as object), headline: edits.headline, body: edits.body };
    update.explanation = edits.explanation;
  }

  const { error } = await supabase.from("cases").update(update).eq("id", id);
  if (error) return fail("Could not update the case.", 500);
  return ok({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const teacher = await currentTeacher();
  if (!teacher) return fail("Please log in as a teacher.", 401);

  const supabase = await sessionClient();
  const { error } = await supabase.from("cases").delete().eq("id", id);
  if (error) return fail("Could not delete the case.", 500);
  return ok({ ok: true });
}
