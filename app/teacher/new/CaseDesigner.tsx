"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { TECHNIQUE_LIST, VERDICT_INFO } from "@/lib/knowledge/techniques";
import { TOPICS } from "@/lib/schemas";
import type { TechniqueId, Verdict } from "@/lib/types";
import { VERDICTS } from "@/lib/types";

const LOADING_LINES = [
  "Gemma 4 is writing the post…",
  "Planting the clues…",
  "Preparing the evidence for each tool…",
  "A second AI is double-checking the clues…",
  "Stamping the case file…",
];

const VERDICT_STYLE: Record<Verdict, string> = {
  real: "border-real bg-real text-ink",
  fake: "border-fake bg-fake text-ink",
  misleading: "border-misleading bg-misleading text-ink",
};

export default function CaseDesigner() {
  const router = useRouter();
  const [verdict, setVerdict] = useState<Verdict>("fake");
  const [techniques, setTechniques] = useState<TechniqueId[]>(["emotional_language"]);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState(false);
  const [line, setLine] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setLine((l) => Math.min(l + 1, LOADING_LINES.length - 1)), 4000);
    return () => clearInterval(t);
  }, [busy]);

  const toggle = (t: TechniqueId) =>
    setTechniques((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : ts.length >= 3 ? ts : [...ts, t]));

  const invalid = verdict !== "real" && techniques.length === 0;

  async function generate() {
    setBusy(true);
    setLine(0);
    setError("");
    try {
      const r = await fetch("/api/teacher/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verdict,
          techniques: verdict === "real" ? [] : techniques,
          difficulty,
          topic,
          hint: hint.trim() || undefined,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error ?? "Could not generate the case.");
      router.push(`/teacher/cases/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate the case.");
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <fieldset className="rounded-2xl border border-smoke bg-night p-5">
        <legend className="px-2 font-display text-lg">1 · The truth (answer key)</legend>
        <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Verdict">
          {VERDICTS.map((v) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={verdict === v}
              onClick={() => setVerdict(v)}
              className={`rounded-xl border-2 p-3 text-left transition ${verdict === v ? VERDICT_STYLE[v] : "border-smoke hover:border-fog"}`}
            >
              <span className="font-display">{VERDICT_INFO[v].label}</span>
              <span className={`block text-xs ${verdict === v ? "" : "text-fog"}`}>{VERDICT_INFO[v].meaning}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={`rounded-2xl border border-smoke bg-night p-5 ${verdict === "real" ? "opacity-50" : ""}`} disabled={verdict === "real"}>
        <legend className="px-2 font-display text-lg">2 · Tricks to plant (pick 1–3)</legend>
        {verdict === "real" && <p className="mb-3 text-sm text-fog">Real cases have no tricks: students should find a clean, trustworthy post.</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          {TECHNIQUE_LIST.map((t) => {
            const on = techniques.includes(t.id) && verdict !== "real";
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(t.id)}
                className={`rounded-xl border-2 p-3 text-left transition ${on ? "border-violet bg-violet/15" : "border-smoke hover:border-fog"}`}
              >
                <span className="font-extrabold"><span aria-hidden="true">{t.emoji}</span> {t.name}</span>
                <span className="block text-xs text-fog">{t.short}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="grid gap-5 rounded-2xl border border-smoke bg-night p-5 sm:grid-cols-2">
        <legend className="px-2 font-display text-lg">3 · Setting</legend>
        <div>
          <p className="font-bold">Difficulty</p>
          <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Difficulty">
            {([1, 2, 3] as const).map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={difficulty === d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 rounded-xl border-2 py-2 font-extrabold ${difficulty === d ? "border-clue bg-clue text-ink" : "border-smoke hover:border-fog"}`}
              >
                {"★".repeat(d)}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-fog">★ obvious · ★★ moderate · ★★★ subtle</p>
        </div>
        <div>
          <label htmlFor="topic" className="font-bold">Topic</label>
          <select
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-2 w-full rounded-xl border-2 border-smoke bg-ink px-3 py-2.5 outline-none focus:border-violet"
          >
            {TOPICS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="hint" className="font-bold">Your idea (optional)</label>
          <input
            id="hint"
            value={hint}
            maxLength={140}
            onChange={(e) => setHint(e.target.value)}
            placeholder="e.g. a fake announcement about the school sports fest"
            className="mt-2 w-full rounded-xl border-2 border-smoke bg-ink px-3 py-2.5 outline-none focus:border-violet"
          />
          <p className="mt-1 text-xs text-fog">Everything stays in the fictional city of Puerto Liwanag. Don&apos;t use real people or events.</p>
        </div>
      </fieldset>

      {error && <p role="alert" className="rounded-lg bg-fake/15 px-3 py-2 text-fake">{error}</p>}

      <Button onClick={generate} disabled={busy || invalid} className="w-full text-lg">
        {busy ? LOADING_LINES[line] : invalid ? "Pick at least one trick" : "✨ Generate case with Gemma 4"}
      </Button>
      {busy && <p className="text-center text-sm text-fog" aria-live="polite">This usually takes 10–40 seconds.</p>}
    </div>
  );
}
