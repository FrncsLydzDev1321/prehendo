// Proxy (formerly "middleware"): runs before /teacher pages render.
// It refreshes the Supabase login session and keeps logged-out users out
// of the teacher area. This is the outer gate; Row Level Security in the
// database is the inner gate.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_TEACHER_PATHS = ["/teacher/login", "/teacher/register"];

export async function proxy(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next(); // pages show a setup notice

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_TEACHER_PATHS.some((p) => path.startsWith(p));

  if (!data.user && path.startsWith("/api/")) {
    return NextResponse.json({ error: "Please log in as a teacher." }, { status: 401 });
  }
  if (!data.user && !isPublic) {
    return NextResponse.redirect(new URL("/teacher/login", request.url));
  }
  if (data.user && isPublic) {
    return NextResponse.redirect(new URL("/teacher", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/teacher/:path*", "/api/teacher/:path*"],
};
