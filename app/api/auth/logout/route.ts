import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { sessionClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (isSupabaseConfigured()) {
    const supabase = await sessionClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
