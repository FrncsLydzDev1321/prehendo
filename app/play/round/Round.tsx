"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { PostCard } from "@/components/PostCard";
import { Button, CautionTape, Stars, TechniqueChip } from "@/components/ui";
import { TECHNIQUES, TECHNIQUE_LIST, TOOL_INFO, VERDICT_INFO } from "@/lib/knowledge/techniques";
import { applyResult, rankFor } from "@/lib/progress";
import { setProgress, useHydrated, useProgress } from "@/lib/progress-store";
import { GRADE_INFO, type ScoreResult } from "@/lib/scoring";
import type { PublicCase, TechniqueId, ToolId, Verdict } from "@/lib/types";
import { TOOL_IDS, VERDICTS } from "@/lib/types";

interface AnswerReply {
  score: ScoreResult;
  answer: {
    verdict: Verdict;
    techniques: TechniqueId[];
    clueNotes: Partial<Record<TechniqueId, string>>;
    explanation: string;
  };
}

type Coach = { status: "loading" } | { status: "done"; message: string; source: "ai" | "library"; model?: string };

const STAMP_COLOR: Record<Verdict, string> = {
  real: "text-real",
  fake: "text-fake",
  misleading: "text-misleading",
};

const VERDICT_BTN: Record<Verdict, { on: string; emoji: string }> = {
  real: { on: "bg-real text-ink border-real", emoji: "✅" },
  fake: { on: "bg-fake text-ink border-fake", emoji: "❌" },
  misleading: { on: "bg-misleading text-ink border-misleading", emoji: "⚠️" },
};

function caseNumber(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return `PL-${String(h % 10000).padStart(4, "0")}`;
}

export default function Round({ level }: { level: number }) {
  const hydrated = useHydrated();
  const progress = useProgress();

  const [cases, setCases] = useState<PublicCase[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [index, setIndex] = useState(0);

  const [revealed, setRevealed] = useState<ToolId[]>([]);
  const [clues, setClues] = useState<TechniqueId[]>([]);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<AnswerReply | null>(null);
  const [coach, setCoach] = useState<Coach | null>(null);

  const [roundPoints, setRoundPoints] = useState(0);
  const [roundCracked, setRoundCracked] = useState(0);
  const [roundBadges, setRoundBadges] = useState<TechniqueId[]>([]);
  const [startXp, setStartXp] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/play/cases?level=${level}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Could not load cases.");
        if (alive) setCases(data.cases as PublicCase[]);
      })
      .catch((e: Error) => alive && setLoadError(e.message));
    return () => {
      alive = false;
    };
  }, [level]);

  if (!hydrated) return <p className="font-type text-fog">Unlocking the evidence room…</p>;

  if (!progress.nickname) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="font-display text-2xl">Who&apos;s on the case?</p>
        <p className="mt-2 text-fog">Pick a detective nickname first.</p>
        <Link href="/play" className="mt-4 inline-block font-extrabold text-clue hover:underline">Go to the lobby →</Link>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md text-center" role="alert">
        <p className="font-display text-2xl text-fake">Evidence room locked</p>
        <p className="mt-2 text-fog">{loadError}</p>
        <Link href="/play" className="mt-4 inline-block font-extrabold text-clue hover:underline">Back to the lobby</Link>
      </div>
    );
  }

  if (!cases) return <p className="font-type text-fog">Pulling case files for level {level}…</p>;

  // ── Round summary ──
  if (finished) {
    const before = rankFor(startXp ?? progress.xp).current.name;
    const after = rankFor(progress.xp).current.name;
    return (
      <section className="mx-auto max-w-2xl text-center rise">
        <p className="font-type text-clue">ROUND REPORT · LEVEL {level}</p>
        <h1 className="font-display text-4xl">Shift complete, {progress.nickname}!</h1>
        <div className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="Points" value={`+${roundPoints}`} />
          <Stat label="Cracked" value={`${roundCracked}/${cases.length}`} />
          <Stat label="Total XP" value={String(progress.xp)} />
        </div>
        {before !== after && (
          <p className="mt-6 rounded-2xl bg-clue px-4 py-3 font-display text-ink">🎖️ Promoted to {after}!</p>
        )}
        {roundBadges.length > 0 && (
          <div className="mt-6">
            <p className="font-extrabold">New badges</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {roundBadges.map((b) => (
                <span key={b} className="rounded-full bg-clue/15 px-3 py-1 font-extrabold text-clue">
                  {TECHNIQUES[b].emoji} {TECHNIQUES[b].badge}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={() => window.location.reload()}>Play another round</Button>
          <Link href="/play" className="inline-flex items-center rounded-xl border-2 border-smoke px-5 py-3 font-extrabold hover:border-fog">
            Back to lobby
          </Link>
        </div>
      </section>
    );
  }

  const current = cases[index];
  if (!current) return null;

  async function submit() {
    if (!verdict) return;
    setSubmitting(true);
    setSubmitError("");
    const payload = { caseId: current.id, verdict, clues, nickname: progress.nickname };
    try {
      const r = await fetch("/api/play/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Could not file the report.");
      const reply = data as AnswerReply;
      setResult(reply);

      if (startXp === null) setStartXp(progress.xp);
      const { progress: next, newBadges } = applyResult(progress, reply.score);
      setProgress(next);
      setRoundPoints((p) => p + reply.score.points);
      if (reply.score.grade === "cracked") setRoundCracked((c) => c + 1);
      if (newBadges.length) setRoundBadges((b) => [...b, ...newBadges]);

      setCoach({ status: "loading" });
      fetch("/api/play/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((cr) => cr.json())
        .then((c) => setCoach({ status: "done", message: c.message ?? reply.answer.explanation, source: c.source ?? "library", model: c.model }))
        .catch(() => setCoach({ status: "done", message: reply.answer.explanation, source: "library" }));
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function nextCase() {
    if (index + 1 >= cases!.length) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setRevealed([]);
    setClues([]);
    setVerdict(null);
    setResult(null);
    setCoach(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const toggleClue = (t: TechniqueId) =>
    setClues((cs) => (cs.includes(t) ? cs.filter((x) => x !== t) : [...cs, t]));

  return (
    <div>
      {/* Round header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/play" className="text-sm text-fog hover:text-chalk">← Lobby</Link>
          <span className="font-display text-lg">
            Case {index + 1} <span className="text-fog">/ {cases.length}</span>
          </span>
        </div>
        <div className="flex items-center gap-2" aria-label="Round progress">
          {cases.map((c, i) => (
            <span
              key={c.id}
              className={`h-2.5 w-8 rounded-full ${i < index || (i === index && result) ? "bg-clue" : i === index ? "bg-fog" : "bg-smoke"}`}
            />
          ))}
        </div>
        <span className="rounded-full bg-night px-3 py-1 font-extrabold text-clue">+{roundPoints} pts</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Case file */}
        <section aria-label="Case file" className="relative">
          <div className="relative rounded-3xl bg-manila p-3 pt-8 shadow-[0_14px_0_0_rgb(0_0_0/0.4)]">
            <span className="absolute left-5 top-2 font-type text-sm text-graphite">
              CASE #{caseNumber(current.id)} · {current.topic.toUpperCase()} · <Stars n={current.difficulty} tone="light" />
            </span>
            <PostCard content={current.content} />
            {result && (
              <div className="pointer-events-none absolute bottom-16 right-4 sm:right-8">
                <span className={`stamp inline-block bg-paper/70 text-3xl sm:text-4xl ${STAMP_COLOR[result.answer.verdict]}`}>
                  {VERDICT_INFO[result.answer.verdict].label.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="mt-4">
            <CautionTape />
          </div>
        </section>

        {/* Investigation / result panel */}
        <section aria-label="Investigation" className="space-y-5">
          {!result ? (
            <>
              <Panel step="1" title="Investigate">
                <div className="grid gap-2 sm:grid-cols-3">
                  {TOOL_IDS.map((tool) => {
                    const on = revealed.includes(tool);
                    return (
                      <button
                        key={tool}
                        onClick={() => !on && setRevealed((r) => [...r, tool])}
                        aria-pressed={on}
                        className={`rounded-xl border-2 px-3 py-2 text-left text-sm font-bold transition ${
                          on ? "border-clue bg-clue/10" : "border-smoke hover:border-fog"
                        }`}
                      >
                        <span aria-hidden="true">{TOOL_INFO[tool].emoji}</span> {TOOL_INFO[tool].label}
                        <span className="block text-xs font-normal text-fog">{TOOL_INFO[tool].prompt}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 space-y-2" aria-live="polite">
                  {revealed.map((tool) => (
                    <p
                      key={tool}
                      className="rise -rotate-[0.6deg] rounded-md bg-clue px-3 py-2 font-type text-sm leading-snug text-ink shadow-[3px_3px_0_0_rgb(0_0_0/0.35)]"
                    >
                      <strong>{TOOL_INFO[tool].emoji} {TOOL_INFO[tool].label.replace("Check the ", "").toUpperCase()}:</strong>{" "}
                      {current.evidence[tool]}
                    </p>
                  ))}
                </div>
              </Panel>

              <Panel step="2" title="Spot the red flags">
                <p className="-mt-1 mb-3 text-sm text-fog">Tick every trick you found. Leave all unticked if the post looks clean.</p>
                <div className="flex flex-wrap gap-2">
                  {TECHNIQUE_LIST.map((t) => {
                    const on = clues.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => toggleClue(t.id)}
                        aria-pressed={on}
                        title={t.short}
                        className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${
                          on ? "border-violet bg-violet text-ink" : "border-smoke hover:border-fog"
                        }`}
                      >
                        <span aria-hidden="true">{t.emoji}</span> {t.name}
                      </button>
                    );
                  })}
                </div>
              </Panel>

              <Panel step="3" title="Your verdict">
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Verdict">
                  {VERDICTS.map((v) => {
                    const on = verdict === v;
                    return (
                      <button
                        key={v}
                        role="radio"
                        aria-checked={on}
                        onClick={() => setVerdict(v)}
                        className={`rounded-xl border-2 py-3 font-display text-sm sm:text-base transition ${
                          on ? VERDICT_BTN[v].on : "border-smoke hover:border-fog"
                        }`}
                      >
                        <span aria-hidden="true">{VERDICT_BTN[v].emoji}</span> {VERDICT_INFO[v].label}
                      </button>
                    );
                  })}
                </div>
                {verdict && <p className="mt-2 text-xs text-fog">{VERDICT_INFO[verdict].meaning}</p>}
              </Panel>

              {submitError && <p role="alert" className="text-fake">{submitError}</p>}
              <Button onClick={submit} disabled={!verdict || submitting} className="w-full text-lg">
                {submitting ? "Filing report…" : verdict ? "File the report 🗂️" : "Pick a verdict to file"}
              </Button>
            </>
          ) : (
            <ResultPanel
              result={result}
              chosen={verdict!}
              coach={coach}
              isLast={index + 1 >= cases.length}
              onNext={nextCase}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function Panel({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-smoke bg-night p-4">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-clue text-sm text-ink">{step}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-smoke bg-night p-4">
      <p className="font-display text-3xl text-clue">{value}</p>
      <p className="text-sm text-fog">{label}</p>
    </div>
  );
}

function ResultPanel({
  result,
  chosen,
  coach,
  isLast,
  onNext,
}: {
  result: AnswerReply;
  chosen: Verdict;
  coach: Coach | null;
  isLast: boolean;
  onNext: () => void;
}) {
  const { score, answer } = result;
  const grade = GRADE_INFO[score.grade];
  const good = score.grade === "cracked" || score.grade === "solid";

  return (
    <div className="rise space-y-4">
      <div className={`rounded-2xl p-5 ${good ? "bg-real text-ink" : score.grade === "lucky" ? "bg-misleading text-ink" : "bg-fake text-ink"}`}>
        <p className="font-display text-2xl">{grade.title}</p>
        <p className="font-semibold">{grade.line}</p>
        <p className="mt-2 font-display text-3xl">+{score.points} pts</p>
      </div>

      <div className="rounded-2xl border border-smoke bg-night p-4 space-y-3">
        <p>
          You said <strong className={STAMP_COLOR[chosen]}>{VERDICT_INFO[chosen].label.toUpperCase()}</strong>{" "}
          {score.verdictCorrect ? "✅" : "❌"}. The verdict is{" "}
          <strong className={STAMP_COLOR[answer.verdict]}>{VERDICT_INFO[answer.verdict].label.toUpperCase()}</strong>.
        </p>

        {answer.techniques.length === 0 && (
          <p className="text-sm text-fog">This post had no red flags. {score.falseFlags.length === 0 ? "Clean read! 🧼" : ""}</p>
        )}

        <ul className="space-y-2">
          {score.found.map((t) => (
            <li key={t} className="rounded-lg bg-real/10 p-2 text-sm">
              <span className="font-extrabold text-real">✔ Found</span> <TechniqueChip id={t} />
              <span className="mt-1 block text-fog">{answer.clueNotes[t]}</span>
            </li>
          ))}
          {score.missed.map((t) => (
            <li key={t} className="rounded-lg bg-misleading/10 p-2 text-sm">
              <span className="font-extrabold text-misleading">? Missed</span> <TechniqueChip id={t} />
              <span className="mt-1 block text-fog">{answer.clueNotes[t]}</span>
            </li>
          ))}
          {score.falseFlags.map((t) => (
            <li key={t} className="rounded-lg bg-fake/10 p-2 text-sm">
              <span className="font-extrabold text-fake">✖ Not in this case</span> <TechniqueChip id={t} />
            </li>
          ))}
        </ul>

        <p className="text-sm"><strong>Case notes:</strong> {answer.explanation}</p>
      </div>

      <div className="relative rounded-2xl border-2 border-violet/60 bg-night p-4" aria-live="polite">
        <p className="flex items-center gap-2 font-display text-violet">
          <span aria-hidden="true">🕵️‍♀️</span> Chief&apos;s debrief
        </p>
        {coach?.status === "done" ? (
          <>
            <div className="mt-2 leading-relaxed [&_strong]:text-clue">
              <ReactMarkdown>{coach.message}</ReactMarkdown>
            </div>
            <p className="mt-2 text-xs text-fog">
              {coach.source === "ai"
                ? `AI coach · open-weight model ${coach.model ?? ""} · grounded in the Detective Handbook`
                : "From the Detective Handbook"}
            </p>
          </>
        ) : (
          <p className="mt-2 font-type text-fog">Chief is reviewing your report…</p>
        )}
      </div>

      <Button onClick={onNext} className="w-full text-lg">
        {isLast ? "See round report 📋" : "Next case →"}
      </Button>
    </div>
  );
}
