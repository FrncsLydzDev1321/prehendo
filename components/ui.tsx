// Small shared UI pieces.
import Link from "next/link";
import type { ReactNode } from "react";
import { TECHNIQUES, VERDICT_INFO } from "@/lib/knowledge/techniques";
import type { TechniqueId, Verdict } from "@/lib/types";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const text = size === "lg" ? "text-5xl sm:text-7xl" : "text-2xl";
  const icon = size === "lg" ? 64 : 30;
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <svg width={icon} height={icon} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="26" cy="26" r="18" fill="none" stroke="#ffd23f" strokeWidth="7" />
        <circle cx="26" cy="26" r="11" fill="#2ec4b6" opacity="0.35" />
        <path d="M21 20 q5 -5 11 0" stroke="#efeaf8" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="38" y="40" width="22" height="9" rx="4" transform="rotate(45 38 40)" fill="#ff5d73" />
      </svg>
      <span className={`font-display ${text} tracking-wide text-chalk`}>
        PREHEND<span className="text-clue">O</span>
      </span>
    </span>
  );
}

export function TopBar({ right }: { right?: ReactNode }) {
  return (
    <header className="w-full border-b border-smoke/70 bg-ink/70 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Prehendo home">
          <Logo />
        </Link>
        <div className="flex items-center gap-2 text-sm">{right}</div>
      </div>
    </header>
  );
}

export function CautionTape({ text = "SIMULATION · FICTIONAL CASE · FOR TRAINING ONLY" }: { text?: string }) {
  return (
    <div className="tape py-1 overflow-hidden" role="note" aria-label="Simulation notice">
      <p className="mx-auto w-fit bg-ink px-3 font-type text-xs tracking-widest text-clue">{text}</p>
    </div>
  );
}

const VERDICT_STYLE: Record<Verdict, string> = {
  real: "bg-real text-ink",
  fake: "bg-fake text-ink",
  misleading: "bg-misleading text-ink",
};

export function VerdictChip({ verdict }: { verdict: Verdict }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide ${VERDICT_STYLE[verdict]}`}>
      {VERDICT_INFO[verdict].label}
    </span>
  );
}

export function TechniqueChip({ id, tone = "dark" }: { id: TechniqueId; tone?: "dark" | "light" }) {
  const t = TECHNIQUES[id];
  const style = tone === "dark" ? "bg-smoke text-chalk" : "bg-graphite/10 text-graphite";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${style}`}>
      <span aria-hidden="true">{t.emoji}</span>
      {t.name}
    </span>
  );
}

export function Stars({ n, tone = "dark" }: { n: number; tone?: "dark" | "light" }) {
  return (
    <span aria-label={`Difficulty ${n} of 3`} className={`tracking-tight ${tone === "dark" ? "text-clue" : "text-graphite"}`}>
      {"★".repeat(n)}
      <span className={tone === "dark" ? "text-smoke" : "text-graphite/25"}>{"★".repeat(3 - n)}</span>
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "real" }) {
  const styles = {
    primary: "bg-clue text-ink hover:brightness-110 shadow-[0_4px_0_0_#b8921a]",
    real: "bg-real text-ink hover:brightness-110 shadow-[0_4px_0_0_#1b8a80]",
    danger: "bg-fake text-ink hover:brightness-110 shadow-[0_4px_0_0_#b83a4c]",
    ghost: "bg-transparent text-chalk border-2 border-smoke hover:border-fog",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-extrabold transition active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function SetupNotice() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-misleading/70 bg-night p-6 text-chalk">
      <h2 className="font-display text-xl text-misleading">Teacher HQ isn&apos;t connected yet</h2>
      <p className="mt-2 text-fog">
        Add <code className="text-clue">SUPABASE_URL</code>, <code className="text-clue">SUPABASE_PUBLISHABLE_KEY</code>, and{" "}
        <code className="text-clue">SUPABASE_SECRET_KEY</code> to your environment variables, run the SQL in{" "}
        <code className="text-clue">supabase/migrations/0001_init.sql</code>, then restart. Students can still play the starter cases.
      </p>
    </div>
  );
}
