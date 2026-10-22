import { notFound, redirect } from "next/navigation";
import type { CaseRow } from "@/lib/cases-repo";
import { currentTeacher, sessionClient } from "@/lib/supabase/server";
import TeacherBar from "../../TeacherBar";
import CaseReview from "./CaseReview";

export const metadata = { title: "Review case · Prehendo" };

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teacher = await currentTeacher();
  if (!teacher) redirect("/teacher/login");

  const supabase = await sessionClient();
  const { data } = await supabase.from("cases").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <>
      <TeacherBar name={teacher.fullName} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <CaseReview row={data as CaseRow} />
      </main>
    </>
  );
}
