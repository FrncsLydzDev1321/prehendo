import { isSupabaseConfigured } from "@/lib/env";
import { fail, ok, readJson } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { firstIssue, loginSchema } from "@/lib/schemas";
import { sessionClient, usernameToEmail } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return fail("Teacher accounts are not set up yet (missing Supabase keys).", 503);
  if (!rateLimit(`login:${clientIp(req)}`, 10, 5 * 60_000)) return fail("Too many attempts. Wait a few minutes.", 429);

  const parsed = loginSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const supabase = await sessionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(parsed.data.username),
    password: parsed.data.password,
  });
  if (error) return fail("Wrong username or password.", 401);
  return ok({ ok: true });
}
