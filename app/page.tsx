import Link from "next/link";
import { CautionTape, Logo } from "@/components/ui";
import { TECHNIQUE_LIST } from "@/lib/knowledge/techniques";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <CautionTape text="CASE FILES OPEN · PUERTO LIWANAG DETECTIVE BUREAU · CASE FILES OPEN" />

      <section className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-12 text-center">
        <div className="rise">
          <Logo size="lg" />
        </div>
        <p className="rise mx-auto mt-4 max-w-xl font-type text-lg text-fog" style={{ animationDelay: "80ms" }}>
          Every post is a case. Investigate the evidence, call the verdict, and crack fake news before it spreads.
        </p>

        <h1 className="sr-only">Prehendo: a fake news detective game</h1>
        <p className="mt-10 font-display text-sm tracking-widest text-clue">WHO&apos;S ON DUTY TODAY?</p>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Link
            href="/play"
            className="rise group relative rounded-3xl border-2 border-real/60 bg-night p-7 text-left transition hover:-translate-y-1 hover:border-real"
            style={{ animationDelay: "140ms" }}
          >
            <span className="absolute -top-3 right-6 rotate-3 rounded bg-real px-2 py-0.5 font-display text-xs text-ink">
              NO LOGIN
            </span>
            <div className="text-5xl" aria-hidden="true">🕵️</div>
            <h2 className="mt-3 font-display text-2xl text-real">I&apos;m a Student</h2>
            <p className="mt-2 text-fog">
              Solve cases, use detective tools, earn XP and badges. Just pick a nickname.
            </p>
            <span className="mt-5 inline-block font-extrabold text-chalk group-hover:text-real">Start investigating →</span>
          </Link>

          <Link
            href="/teacher"
            className="rise group relative rounded-3xl border-2 border-violet/60 bg-night p-7 text-left transition hover:-translate-y-1 hover:border-violet"
            style={{ animationDelay: "200ms" }}
          >
            <div className="text-5xl" aria-hidden="true">📁</div>
            <h2 className="mt-3 font-display text-2xl text-violet">I&apos;m a Teacher</h2>
            <p className="mt-2 text-fog">
              Design cases with open-weight AI, review every one, and approve what your students play.
            </p>
            <span className="mt-5 inline-block font-extrabold text-chalk group-hover:text-violet">Open Teacher HQ →</span>
          </Link>
        </div>

        <div className="mt-14">
          <p className="font-display text-sm tracking-widest text-fog">THE SIX TRICKS YOU&apos;LL LEARN TO SPOT</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {TECHNIQUE_LIST.map((t) => (
              <li key={t.id} className="rounded-full border border-smoke bg-night px-3 py-1.5 text-sm font-bold">
                <span aria-hidden="true">{t.emoji}</span> {t.name}
              </li>
            ))}
          </ul>
          <Link href="/learn" className="mt-5 inline-block font-extrabold text-clue underline-offset-4 hover:underline">
            Read the Detective Handbook
          </Link>
        </div>
      </section>

      <footer className="border-t border-smoke/70 px-4 py-5 text-center text-xs text-fog">
        All cases are fictional and set in the made-up city of Puerto Liwanag. AI suggestions are reviewed by teachers.
        <br />
        Open source (MIT) · Powered by open-weight models: Gemma 4 &amp; GPT-OSS
      </footer>
    </main>
  );
}
