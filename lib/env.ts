// Read environment variables lazily (at request time, never at build time),
// so the app can build even before you add your keys.
// None of these are exposed to the browser: none start with NEXT_PUBLIC_.

export function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

export function supabaseConfig() {
  const url = env("SUPABASE_URL");
  const publishableKey = env("SUPABASE_PUBLISHABLE_KEY");
  const secretKey = env("SUPABASE_SECRET_KEY");
  return { url, publishableKey, secretKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, publishableKey } = supabaseConfig();
  return Boolean(url && publishableKey);
}
