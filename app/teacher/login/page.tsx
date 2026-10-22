import { SetupNotice, TopBar } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/env";
import AuthForm from "../AuthForm";

// Read env + login cookies on every request (never prerender).
export const dynamic = "force-dynamic";

export const metadata = { title: "Teacher login · Prehendo" };

export default function LoginPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-md px-4 py-12">
        <p className="font-type text-violet">TEACHER HQ</p>
        <h1 className="font-display text-3xl">Welcome back</h1>
        <p className="mb-6 mt-1 text-fog">Log in to design and approve cases for your students.</p>
        {isSupabaseConfigured() ? <AuthForm mode="login" /> : <SetupNotice />}
      </main>
    </>
  );
}
