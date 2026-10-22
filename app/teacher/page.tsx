import Link from "next/link";
import { redirect } from "next/navigation";
import { SetupNotice, Stars, TechniqueChip, TopBar, VerdictChip } from "@/components/ui";
import type { CaseRow } from "@/lib/cases-repo";
import { isSupabaseConfigured } from "@/lib/env";
import { currentTeacher, sessionClient } from "@/lib/supabase/server";
import TeacherBar from "./TeacherBar";

// Read env + login cookies on every request (never prerender).
export const dynamic = "force-dynamic";

export const metadata = { title: "Teacher HQ · Prehendo" };

const STATUS_STYLE = {
  pending: "bg-misleading/20 text-misleading",
  approved: "bg-real/20 text-real",
  rejected: "bg-fake/20 text-fake",
} as const;

export default async function TeacherHQ() {
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

  const supabase = await sessionClient();
  const [{ data: rows, error }, { data: attempts }] = await Promise.all([
    supabase.from("cases").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("attempts").select("case_id, correct").limit(5000),
  ]);
  const cases = (rows ?? []) as CaseRow[];

  const plays = new Map<string, { n: number; correct: number }>();
  for (const a of attempts ?? []) {
    const s = plays.get(a.case_id) ?? { n: 0, correct: 0 };
    s.n++;
    if (a.correct) s.correct++;
    plays.set(a.case_id, s);
  }

  const count = (s: CaseRow["status"]) => cases.filter((c) => c.status === s).length;
  const totalPlays = [...plays.values()].reduce((sum, p) => sum + p.n, 0);

  return (
    <>
      <TeacherBar name={teacher.fullName} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-type text-violet">TEACHER HQ</p>
            <h1 className="font-display text-3xl">Hello, {teacher.fullName.split(" ")[0]}</h1>
            <p className="text-fog">AI drafts the cases. You decide what your students play.</p>
          </div>
          <Link
            href="/teacher/new"
            className="rounded-xl bg-clue px-5 py-3 font-extrabold text-ink shadow-[0_4px_0_0_#b8921a] hover:brightness-110"
          >
            + Design a new case
          </Link>
        </div>

        {error && (
          <p role="alert" className="mt-6 rounded-xl bg-fake/15 p-4 text-fake">
            Could not load cases: did you run <code>supabase/migrations/0001_init.sql</code>? ({error.message})
          </p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Waiting for review", count("pending"), "text-misleading"],
            ["Approved (live)", count("approved"), "text-real"],
            ["Rejected", count("rejected"), "text-fake"],
            ["Student plays", totalPlays, "text-clue"],
          ].map(([label, n, color]) => (
            <div key={label as string} className="rounded-2xl border border-smoke bg-night p-4">
              <p className={`font-display text-3xl ${color}`}>{n}</p>
              <p className="text-sm text-fog">{label}</p>
            </div>
          ))}
        </div>

        <section className="mt-10" aria-labelledby="cases">
          <h2 id="cases" className="font-display text-xl">Your case files</h2>
          {cases.length === 0 ? (
            <div className="mt-4 rounded-2xl border-2 border-dashed border-smoke p-8 text-center text-fog">
              No cases yet. Students are playing the 15 built-in starter cases until you add your own.
              <br />
              <Link href="/teacher/new" className="mt-3 inline-block font-extrabold text-clue hover:underline">Design your first case →</Link>
            </div>
          ) : (
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {cases.map((c) => {
                const p = plays.get(c.id);
                const v = c.validation as { passed?: boolean | null } | null;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/teacher/cases/${c.id}`}
                      className="block h-full rounded-2xl border border-smoke bg-night p-4 transition hover:-translate-y-0.5 hover:border-fog"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold uppercase ${STATUS_STYLE[c.status]}`}>
                          {c.status}
                        </span>
                        <Stars n={c.difficulty} />
                      </div>
                      <p className="mt-2 line-clamp-2 font-extrabold">{c.content.headline}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <VerdictChip verdict={c.verdict} />
                        {c.techniques.map((t) => <TechniqueChip key={t} id={t} />)}
                      </div>
                      <p className="mt-2 text-xs text-fog">
                        {c.topic} · AI check: {v?.passed === true ? "✅ passed" : v?.passed === false ? "⚠️ flagged" : "— not checked"}
                        {p ? ` · ${p.n} plays, ${Math.round((p.correct / p.n) * 100)}% correct` : ""}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
