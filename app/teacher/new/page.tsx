import { redirect } from "next/navigation";
import { SetupNotice, TopBar } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/env";
import { currentTeacher } from "@/lib/supabase/server";
import TeacherBar from "../TeacherBar";
import CaseDesigner from "./CaseDesigner";

// Read env + login cookies on every request (never prerender).
export const dynamic = "force-dynamic";

export const metadata = { title: "Design a case · Prehendo" };

export default async function NewCasePage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <TopBar />
        <main className="mx-auto w-full max-w-3xl px-4 py-12"><SetupNotice /></main>
      </>
    );
  }
  const teacher = await currentTeacher();
  if (!teacher) redirect("/teacher/login");

  return (
    <>
      <TeacherBar name={teacher.fullName} />
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <p className="font-type text-violet">CASE DESIGNER</p>
        <h1 className="font-display text-3xl">Design a new case</h1>
        <p className="mt-1 max-w-2xl text-fog">
          You choose the answer key. The open-weight AI (Gemma 4) only writes the story to match it,
          a second model checks the clues, and nothing reaches students until you approve it.
        </p>
        <CaseDesigner />
      </main>
    </>
  );
}
