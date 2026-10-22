"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui";
import { TECHNIQUE_LIST } from "@/lib/knowledge/techniques";
import { BADGE_THRESHOLD, LEVEL_UNLOCK_XP, isLevelUnlocked, rankFor } from "@/lib/progress";
import { setProgress, useHydrated, useProgress } from "@/lib/progress-store";
import type { Difficulty } from "@/lib/types";

const LEVELS: { level: Difficulty; name: string; blurb: string }[] = [
  { level: 1, name: "Rookie Cases", blurb: "Loud clues. Learn the tools." },
  { level: 2, name: "Street Cases", blurb: "Clues hide in the details." },
  { level: 3, name: "Cold Cases", blurb: "Calm, professional, and tricky." },
];

export default function Lobby() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  if (!hydrated) return <p className="font-type text-fog">Opening the case files…</p>;

  if (!progress.nickname) {
    return (
      <section className="mx-auto max-w-md rise">
        <p className="font-type text-clue">NEW RECRUIT</p>
        <h1 className="font-display text-3xl">Pick your detective name</h1>
        <p className="mt-2 text-fog">
          No email or password needed. Use a nickname, not your real full name.
        </p>
        <form
          className="mt-6 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const n = name.trim();
            if (n.length < 2 || n.length > 24) return setError("Use 2–24 characters.");
            setProgress({ ...progress, nickname: n });
          }}
        >
          <label htmlFor="nick" className="font-bold">Detective nickname</label>
          <input
            id="nick"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            maxLength={24}
            placeholder="e.g. Agent Kalamansi"
            className="rounded-xl border-2 border-smoke bg-night px-4 py-3 text-lg outline-none focus:border-clue"
            autoComplete="off"
          />
          {error && <p role="alert" className="text-fake">{error}</p>}
          <Button type="submit">Join the Bureau</Button>
        </form>
      </section>
    );
  }

  const { current, next } = rankFor(progress.xp);
  const pct = next ? Math.round(((progress.xp - current.minXp) / (next.minXp - current.minXp)) * 100) : 100;

  return (
    <div className="space-y-10">
      <section className="rise rounded-3xl border border-smoke bg-night p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-type text-clue">DETECTIVE ID</p>
            <h1 className="font-display text-3xl">{progress.nickname}</h1>
            <p className="text-fog">
              Rank: <strong className="text-chalk">{current.name}</strong> · {progress.casesPlayed} cases · {progress.casesCracked} cracked
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl text-clue">{progress.xp}</p>
            <p className="text-sm text-fog">XP</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-3 overflow-hidden rounded-full bg-smoke" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next rank">
            <div className="h-full rounded-full bg-clue transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-xs text-fog">
            {next ? `${next.minXp - progress.xp} XP to ${next.name}` : "Top rank reached. Legendary!"}
          </p>
        </div>
      </section>

      <section aria-labelledby="levels">
        <h2 id="levels" className="font-display text-xl">Choose your case files</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {LEVELS.map(({ level, name, blurb }) => {
            const unlocked = isLevelUnlocked(level, progress.xp);
            const card = (
              <div
                className={`relative h-full rounded-2xl p-5 transition ${
                  unlocked ? "paper hover:-translate-y-1 shadow-[0_8px_0_0_rgb(0_0_0/0.35)]" : "border-2 border-dashed border-smoke bg-night text-fog"
                }`}
              >
                <span className="absolute -top-3 left-4 rounded bg-manila px-2 py-0.5 font-type text-xs text-graphite">
                  LEVEL {level}
                </span>
                <p className="mt-2 font-display text-lg">{name}</p>
                <p className="text-sm">{blurb}</p>
                <p className="mt-3 text-sm font-extrabold">
                  {unlocked ? "5 cases · Play →" : `🔒 Unlocks at ${LEVEL_UNLOCK_XP[level]} XP`}
                </p>
              </div>
            );
            return unlocked ? (
              <Link key={level} href={`/play/round?level=${level}`} className="block">
                {card}
              </Link>
            ) : (
              <div key={level} aria-disabled="true">{card}</div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="badges">
        <h2 id="badges" className="font-display text-xl">Badge case</h2>
        <p className="text-sm text-fog">Spot a trick {BADGE_THRESHOLD} times to earn its badge.</p>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TECHNIQUE_LIST.map((t) => {
            const earned = progress.badges.includes(t.id);
            const hits = progress.techniqueHits[t.id] ?? 0;
            return (
              <li
                key={t.id}
                className={`rounded-2xl border p-4 ${earned ? "border-clue bg-clue/10" : "border-smoke bg-night opacity-80"}`}
              >
                <p className={`text-3xl ${earned ? "wiggle" : "grayscale"}`} aria-hidden="true">{t.emoji}</p>
                <p className="mt-1 font-extrabold">{t.badge}</p>
                <p className="text-xs text-fog">
                  {earned ? "Earned!" : `${Math.min(hits, BADGE_THRESHOLD)}/${BADGE_THRESHOLD} ${t.name}`}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/learn" className="font-extrabold text-clue hover:underline">📖 Detective Handbook</Link>
        <button
          className="text-fog underline-offset-4 hover:underline"
          onClick={() => setProgress({ ...progress, nickname: "" })}
        >
          Change nickname
        </button>
      </div>
    </div>
  );
}
