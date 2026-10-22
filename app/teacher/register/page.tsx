import { SetupNotice, TopBar } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/env";
import AuthForm from "../AuthForm";

// Read env + login cookies on every request (never prerender).
export const dynamic = "force-dynamic";

export const metadata = { title: "Teacher registration · Prehendo" };

export default function RegisterPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-md px-4 py-12">
        <p className="font-type text-violet">TEACHER HQ</p>
        <h1 className="font-display text-3xl">Join as a teacher</h1>
        <p className="mb-6 mt-1 text-fog">You review every AI-written case before students see it.</p>
        {isSupabaseConfigured() ? <AuthForm mode="register" /> : <SetupNotice />}
      </main>
    </>
  );
}
