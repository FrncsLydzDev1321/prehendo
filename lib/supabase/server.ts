// Supabase clients (server-side only).
//
// - sessionClient(): acts AS the logged-in teacher. Row Level Security applies.
// - adminClient(): uses the secret key and bypasses RLS. Only used by student
//   game routes to read approved cases and record anonymous attempts.
//   NEVER import this into a client component.
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseConfig } from "@/lib/env";

export async function sessionClient(): Promise<SupabaseClient> {
  const { url, publishableKey } = supabaseConfig();
  if (!url || !publishableKey) throw new Error("Supabase is not configured.");
  const cookieStore = await cookies();
  return createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are refreshed by proxy.ts instead.
        }
      },
    },
  });
}

let admin: SupabaseClient | null = null;
export function adminClient(): SupabaseClient | null {
  const { url, secretKey } = supabaseConfig();
  if (!url || !secretKey) return null;
  admin ??= createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

/** Usernames become hidden emails, because Supabase Auth signs in with email. */
export function usernameToEmail(username: string): string {
  return `${username.toLowerCase()}@teachers.prehendo.example.com`;
}

export interface TeacherProfile {
  id: string;
  fullName: string;
  username: string;
}

export async function currentTeacher(): Promise<TeacherProfile | null> {
  const supabase = await sessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const meta = data.user.user_metadata as { full_name?: string; username?: string };
  return { id: data.user.id, fullName: meta.full_name ?? "Teacher", username: meta.username ?? "" };
}
