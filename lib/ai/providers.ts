// ─────────────────────────────────────────────────────────────
// Inference tier. Every provider here hosts OPEN-WEIGHT models and speaks
// the OpenAI-compatible chat API, so switching providers is just a
// different URL + key + model name.
//
//   Primary:  Gemma 4 26B (Google, Apache 2.0) on Cloudflare Workers AI
//   Backup /  GPT-OSS 20B & 120B (OpenAI, Apache 2.0) on Groq
//   validator
// ─────────────────────────────────────────────────────────────
import type { z } from "zod";
import { env } from "@/lib/env";
import { extractJson } from "@/lib/ai/json";

export interface Provider {
  name: string;
  model: string;
  url: string;
  apiKey: string;
  jsonMode: boolean;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function cloudflare(): Provider | null {
  const accountId = env("CLOUDFLARE_ACCOUNT_ID");
  const apiKey = env("CLOUDFLARE_API_TOKEN");
  if (!accountId || !apiKey) return null;
  return {
    name: "Cloudflare Workers AI",
    model: env("CLOUDFLARE_MODEL") ?? "@cf/google/gemma-4-26b-a4b-it",
    url: `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`,
    apiKey,
    jsonMode: false,
  };
}

function groq(model: string): Provider | null {
  const apiKey = env("GROQ_API_KEY");
  if (!apiKey) return null;
  return {
    name: "Groq",
    model,
    url: "https://api.groq.com/openai/v1/chat/completions",
    apiKey,
    jsonMode: true,
  };
}

const present = (list: (Provider | null)[]) => list.filter((p): p is Provider => p !== null);

/** Writes cases. Gemma 4 first, GPT-OSS 120B as backup. */
export const writerProviders = () =>
  present([cloudflare(), groq(env("GROQ_WRITER_MODEL") ?? "openai/gpt-oss-120b")]);

/** Checks cases. A DIFFERENT model family from the writer, so it doesn't grade its own work. */
export const validatorProviders = () =>
  present([groq(env("GROQ_VALIDATOR_MODEL") ?? "openai/gpt-oss-20b"), cloudflare()]);

/** Coaches students. Gemma 4 first, GPT-OSS 20B as backup. */
export const coachProviders = () =>
  present([cloudflare(), groq(env("GROQ_VALIDATOR_MODEL") ?? "openai/gpt-oss-20b")]);

export class AIUnavailableError extends Error {
  constructor(public readonly attempts: string[]) {
    super(`All AI providers failed: ${attempts.join(" | ") || "none configured"}`);
    this.name = "AIUnavailableError";
  }
}

async function callOnce(
  p: Provider,
  messages: ChatMessage[],
  opts: { temperature: number; maxTokens: number; timeoutMs: number },
): Promise<string> {
  const res = await fetch(p.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.apiKey}` },
    body: JSON.stringify({
      model: p.model,
      messages,
      temperature: opts.temperature,
      max_tokens: opts.maxTokens,
      ...(p.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: AbortSignal.timeout(opts.timeoutMs),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty reply");
  return content;
}

/**
 * Ask for JSON, validate it with a Zod schema, and fall back to the next
 * provider if a call fails or returns something malformed.
 */
export async function chatJSON<S extends z.ZodType>(
  providers: Provider[],
  messages: ChatMessage[],
  schema: S,
  opts: Partial<{ temperature: number; maxTokens: number; timeoutMs: number }> = {},
): Promise<{ data: z.infer<S>; provider: Provider }> {
  const settings = { temperature: 0.4, maxTokens: 1500, timeoutMs: 30_000, ...opts };
  const attempts: string[] = [];

  for (const p of providers) {
    try {
      const raw = await callOnce(p, messages, settings);
      const parsed = schema.safeParse(extractJson(raw));
      if (!parsed.success) {
        throw new Error(`Bad shape: ${parsed.error.issues[0]?.path.join(".")} ${parsed.error.issues[0]?.message}`);
      }
      return { data: parsed.data, provider: p };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      attempts.push(`${p.name} (${p.model}): ${msg}`);
      console.error(`[ai] ${p.name} ${p.model} failed:`, msg);
    }
  }
  throw new AIUnavailableError(attempts);
}
