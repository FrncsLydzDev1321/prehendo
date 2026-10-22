"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

type Mode = "login" | "register";

const FIELDS: Record<Mode, { name: string; label: string; type: string; autoComplete: string }[]> = {
  login: [
    { name: "username", label: "Username", type: "text", autoComplete: "username" },
    { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
  ],
  register: [
    { name: "fullName", label: "Full name", type: "text", autoComplete: "name" },
    { name: "username", label: "Username", type: "text", autoComplete: "username" },
    { name: "password", label: "Password (8+ characters)", type: "password", autoComplete: "new-password" },
    { name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password" },
  ],
};

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "register" && values.password !== values.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error ?? "Something went wrong.");
      router.push("/teacher");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {FIELDS[mode].map((f) => (
        <div key={f.name} className="flex flex-col gap-1">
          <label htmlFor={f.name} className="font-bold">{f.label}</label>
          <input
            id={f.name}
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            required
            value={values[f.name] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
            className="rounded-xl border-2 border-smoke bg-ink px-4 py-3 outline-none focus:border-violet"
          />
          {f.name === "username" && mode === "register" && (
            <span className="text-xs text-fog">3–20 lowercase letters, numbers, or underscores.</span>
          )}
        </div>
      ))}
      {error && (
        <p role="alert" className="rounded-lg bg-fake/15 px-3 py-2 text-sm text-fake">{error}</p>
      )}
      <Button type="submit" disabled={busy} className="mt-2">
        {busy ? "One moment…" : mode === "login" ? "Log in to HQ" : "Create teacher account"}
      </Button>
      <p className="text-center text-sm text-fog">
        {mode === "login" ? (
          <>New here? <Link className="font-bold text-violet hover:underline" href="/teacher/register">Create an account</Link></>
        ) : (
          <>Already registered? <Link className="font-bold text-violet hover:underline" href="/teacher/login">Log in</Link></>
        )}
      </p>
    </form>
  );
}
