"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PostCard } from "@/components/PostCard";
import { Button, Stars, TechniqueChip, VerdictChip } from "@/components/ui";
import type { ValidationReport } from "@/lib/ai/generate";
import type { CaseRow } from "@/lib/cases-repo";
import { TECHNIQUES, TOOL_INFO } from "@/lib/knowledge/techniques";
import { TOOL_IDS } from "@/lib/types";

export default function CaseReview({ row }: { row: CaseRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [headline, setHeadline] = useState(row.content.headline);
  const [body, setBody] = useState(row.content.body);
  const [explanation, setExplanation] = useState(row.explanation);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const v = row.validation as ValidationReport | null;
  const edited = headline !== row.content.headline || body !== row.content.body || explanation !== row.explanation;

  async function review(action: "approve" | "reject" | "unpublish") {
    setBusy(action);
    setError("");
    const r = await fetch(`/api/teacher/cases/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, edits: edited ? { headline, body, explanation } : undefined }),
    });
    const data = await r.json().catch(() => ({}));
    setBusy(null);
    if (!r.ok) return setError(data.error ?? "Could not save.");
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("Delete this case permanently?")) return;
    setBusy("delete");
    const r = await fetch(`/api/teacher/cases/${row.id}`, { method: "DELETE" });
    if (!r.ok) {
      setBusy(null);
      return setError("Could not delete.");
    }
    router.push("/teacher");
    router.refresh();
  }

  async function regenerate() {
    setBusy("regenerate");
    setError("");
    const r = await fetch("/api/teacher/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verdict: row.verdict,
        techniques: row.techniques,
        difficulty: row.difficulty,
        topic: row.topic,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setBusy(null);
      return setError(data.error ?? "Could not regenerate.");
    }
    if (row.status !== "approved") await fetch(`/api/teacher/cases/${row.id}`, { method: "DELETE" });
    router.push(`/teacher/cases/${data.id}`);
    router.refresh();
  }

  const preview = { ...row.content, headline, body };

  return (
    <div>
      <Link href="/teacher" className="text-sm text-fog hover:text-chalk">← Back to HQ</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl">Review case</h1>
        <span className="rounded-full bg-smoke px-2.5 py-0.5 text-xs font-extrabold uppercase">{row.status}</span>
        <Stars n={row.difficulty} />
        <span className="text-sm text-fog">{row.topic}</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section aria-label="Student view" className="space-y-4">
          <p className="font-type text-sm text-fog">WHAT STUDENTS WILL SEE</p>
          <PostCard content={preview} />
          <div className="space-y-2">
            <p className="font-type text-sm text-fog">EVIDENCE REVEALED BY EACH TOOL</p>
            {TOOL_IDS.map((t) => (
              <p key={t} className="rounded-md bg-clue px-3 py-2 font-type text-sm text-ink">
                <strong>{TOOL_INFO[t].emoji} {TOOL_INFO[t].label}:</strong> {row.evidence[t]}
              </p>
            ))}
          </div>
        </section>

        <section aria-label="Answer key and review" className="space-y-4">
          <div className="rounded-2xl border border-smoke bg-night p-4">
            <p className="font-display">Answer key (set by you)</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <VerdictChip verdict={row.verdict} />
              {row.techniques.map((t) => <TechniqueChip key={t} id={t} />)}
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {row.techniques.map((t) => (
                <li key={t}>
                  <strong>{TECHNIQUES[t].emoji} {TECHNIQUES[t].name}:</strong>{" "}
                  <span className="text-fog">{row.clue_notes?.[t] ?? "No note."}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`rounded-2xl border-2 p-4 ${
              v?.passed === true ? "border-real/60" : v?.passed === false ? "border-fake/70" : "border-misleading/60"
            }`}
          >
            <p className="font-display">
              AI quality check:{" "}
              {v?.passed === true ? <span className="text-real">passed ✅</span> : v?.passed === false ? <span className="text-fake">needs attention ⚠️</span> : <span className="text-misleading">not checked</span>}
            </p>
            <p className="mt-1 text-xs text-fog">
              Written by <code>{v?.writerModel ?? row.ai_model ?? "unknown"}</code>
              {v?.validatorModel && <> · checked by <code>{v.validatorModel}</code></>}
              {v?.attempts ? ` · ${v.attempts} attempt${v.attempts > 1 ? "s" : ""}` : ""}
            </p>
            {v?.detected && v.validatorModel && (
              <p className="mt-2 text-sm">
                Validator detected:{" "}
                {v.detected.length ? v.detected.map((t) => TECHNIQUES[t]?.name ?? t).join(", ") : "no tricks"}
              </p>
            )}
            {v?.issues?.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fog">
                {v.issues.map((i) => <li key={i}>{i}</li>)}
              </ul>
            ) : null}
            <p className="mt-2 text-xs text-fog">The AI suggests. You decide.</p>
          </div>

          <div className="rounded-2xl border border-smoke bg-night p-4">
            <div className="flex items-center justify-between">
              <p className="font-display">Story &amp; explanation</p>
              <button className="text-sm font-bold text-violet hover:underline" onClick={() => setEditing((e) => !e)}>
                {editing ? "Done editing" : "✏️ Edit"}
              </button>
            </div>
            {editing ? (
              <div className="mt-3 space-y-3">
                <label className="block text-sm font-bold">
                  Headline
                  <input value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={160}
                    className="mt-1 w-full rounded-lg border-2 border-smoke bg-ink px-3 py-2 font-normal outline-none focus:border-violet" />
                </label>
                <label className="block text-sm font-bold">
                  Post text
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={900} rows={6}
                    className="mt-1 w-full rounded-lg border-2 border-smoke bg-ink px-3 py-2 font-normal outline-none focus:border-violet" />
                </label>
                <label className="block text-sm font-bold">
                  Explanation shown after answering
                  <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} maxLength={700} rows={4}
                    className="mt-1 w-full rounded-lg border-2 border-smoke bg-ink px-3 py-2 font-normal outline-none focus:border-violet" />
                </label>
              </div>
            ) : (
              <p className="mt-2 text-sm text-fog">{explanation}</p>
            )}
            {edited && <p className="mt-2 text-xs text-clue">Unsaved edits will be saved when you approve or reject.</p>}
          </div>

          {error && <p role="alert" className="rounded-lg bg-fake/15 px-3 py-2 text-fake">{error}</p>}

          <div className="grid gap-2 sm:grid-cols-2">
            {row.status !== "approved" ? (
              <Button variant="real" onClick={() => review("approve")} disabled={!!busy}>
                {busy === "approve" ? "Approving…" : "✅ Approve for students"}
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => review("unpublish")} disabled={!!busy}>
                {busy === "unpublish" ? "Moving…" : "Unpublish (back to review)"}
              </Button>
            )}
            {row.status !== "rejected" && (
              <Button variant="danger" onClick={() => review("reject")} disabled={!!busy}>
                {busy === "reject" ? "Rejecting…" : "✖ Reject"}
              </Button>
            )}
            <Button variant="ghost" onClick={regenerate} disabled={!!busy}>
              {busy === "regenerate" ? "Rewriting with Gemma 4…" : "🔄 Regenerate"}
            </Button>
            <Button variant="ghost" onClick={remove} disabled={!!busy}>
              {busy === "delete" ? "Deleting…" : "🗑 Delete"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
