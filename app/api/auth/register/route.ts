import { isSupabaseConfigured } from "@/lib/env";
import { fail, ok, readJson } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { firstIssue, registerSchema } from "@/lib/schemas";
import { sessionClient, usernameToEmail } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return fail("Teacher accounts are not set up yet (missing Supabase keys).", 503);
  if (!rateLimit(`register:${clientIp(req)}`, 5, 10 * 60_000)) return fail("Too many attempts. Try again later.", 429);

  const parsed = registerSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { fullName, username, password } = parsed.data;

  const supabase = await sessionClient();
  const { data, error } = await supabase.auth.signUp({
    email: usernameToEmail(username),
    password,
    options: { data: { full_name: fullName, username } },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("database error")) {
      return fail("That username is already taken.", 409);
    }
    console.error("[register]", error.message);
    return fail("Could not create the account. Please try again.", 500);
  }
  if (!data.session) {
    // Supabase is still set to "Confirm email". Our usernames have no real inbox.
    return fail(
      "Account created, but Supabase requires email confirmation. In Supabase, turn OFF Authentication → Email → 'Confirm email', then register again with a new username.",
      409,
    );
  }
  return ok({ ok: true });
}
