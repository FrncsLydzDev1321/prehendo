import { TopBar } from "@/components/ui";
import { TECHNIQUE_LIST, TOOL_INFO, VERDICT_INFO } from "@/lib/knowledge/techniques";

export const metadata = { title: "Detective Handbook · Prehendo" };

export default function LearnPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="font-type text-clue">CLASSIFIED · TRAINING MATERIAL</p>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl">Detective Handbook</h1>
        <p className="mt-2 max-w-2xl text-fog">
          These cards are the game&apos;s knowledge base. The AI reads them before it writes a case or coaches you,
          so everyone uses the same definitions.
        </p>

        <section className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Verdicts">
          {(Object.keys(VERDICT_INFO) as (keyof typeof VERDICT_INFO)[]).map((v) => (
            <div key={v} className="rounded-2xl bg-night p-4 border border-smoke">
              <p className={`font-display text-lg ${v === "real" ? "text-real" : v === "fake" ? "text-fake" : "text-misleading"}`}>
                {VERDICT_INFO[v].label}
              </p>
              <p className="mt-1 text-sm text-fog">{VERDICT_INFO[v].meaning}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2" aria-label="Techniques">
          {TECHNIQUE_LIST.map((t, i) => (
            <article
              key={t.id}
              className="paper rise relative rounded-2xl p-5 shadow-[0_8px_0_0_rgb(0_0_0/0.35)]"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="absolute -top-3 left-5 rounded bg-manila px-2 py-0.5 font-type text-xs text-graphite">
                FILE #{String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-2 flex items-center gap-2 font-display text-xl text-graphite">
                <span aria-hidden="true">{t.emoji}</span> {t.name}
              </h2>
              <p className="mt-2">{t.whatItIs}</p>
              <p className="mt-3 font-extrabold">How to spot it</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {t.howToSpot.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <p className="mt-3 rounded-lg bg-graphite/5 p-3 font-type text-sm">Example: {t.example}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  Best tool:{" "}
                  <strong>
                    {t.revealedBy === "read" ? "📖 Read the post closely" : `${TOOL_INFO[t.revealedBy].emoji} ${TOOL_INFO[t.revealedBy].label}`}
                  </strong>
                </span>
                <span className="rounded-full bg-graphite px-2.5 py-0.5 text-xs font-extrabold text-clue">🏅 {t.badge}</span>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
