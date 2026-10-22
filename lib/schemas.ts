// Zod schemas: every input from users and every output from AI models
// is checked here before we trust it.
import { z } from "zod";
import { TECHNIQUE_IDS, VERDICTS } from "@/lib/types";

export const verdictSchema = z.enum(VERDICTS);
export const techniqueSchema = z.enum(TECHNIQUE_IDS);

export const TOPICS = [
  "School life",
  "Social media trends",
  "Online scams",
  "Local events",
  "Weather and safety",
  "Sports",
  "Science and technology",
  "Entertainment and media",
] as const;

// ── Blueprint (chosen by the teacher) ─────────────────────────
export const blueprintSchema = z
  .object({
    verdict: verdictSchema,
    techniques: z.array(techniqueSchema).max(3),
    difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    topic: z.enum(TOPICS),
    hint: z.string().trim().max(140).optional(),
  })
  .superRefine((b, ctx) => {
    if (b.verdict === "real" && b.techniques.length > 0) {
      ctx.addIssue({ code: "custom", message: "A Real case cannot have red-flag techniques." });
    }
    if (b.verdict !== "real" && b.techniques.length === 0) {
      ctx.addIssue({ code: "custom", message: "Pick at least one technique for a Fake or Misleading case." });
    }
    if (new Set(b.techniques).size !== b.techniques.length) {
      ctx.addIssue({ code: "custom", message: "Techniques must be unique." });
    }
  });

// ── What the AI writer must return ────────────────────────────
export const caseContentSchema = z.object({
  format: z.enum(["social", "news"]),
  platform: z.string().min(2).max(40),
  accountName: z.string().min(2).max(60),
  accountHandle: z.string().min(2).max(40),
  postedAgo: z.string().min(1).max(20),
  headline: z.string().min(5).max(160),
  body: z.string().min(20).max(900),
  photo: z
    .object({ description: z.string().min(5).max(200), caption: z.string().min(2).max(160) })
    .nullable(),
  stats: z.object({
    likes: z.number().int().min(0).max(1_000_000),
    shares: z.number().int().min(0).max(1_000_000),
    comments: z.number().int().min(0).max(1_000_000),
  }),
});

export const evidenceSchema = z.object({
  account: z.string().min(10).max(300),
  date: z.string().min(10).max(300),
  source: z.string().min(10).max(300),
});

export const writerOutputSchema = z.object({
  content: caseContentSchema,
  evidence: evidenceSchema,
  explanation: z.string().min(20).max(700),
  clueNotes: z.record(z.string(), z.string().max(240)).default({}),
});
export type WriterOutput = z.infer<typeof writerOutputSchema>;

// ── What the AI validator must return ─────────────────────────
export const validatorOutputSchema = z.object({
  detected: z.array(z.string()),
  ageAppropriate: z.boolean(),
  fictionalOnly: z.boolean(),
  issues: z.array(z.string()).default([]),
});

// ── Coach output ──────────────────────────────────────────────
export const coachOutputSchema = z.object({
  message: z.string().min(10).max(900),
});

// ── Requests from the browser ─────────────────────────────────
export const answerRequestSchema = z.object({
  caseId: z.string().min(1).max(64),
  verdict: verdictSchema,
  clues: z.array(techniqueSchema).max(6),
  nickname: z.string().trim().min(1).max(24),
});

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,20}$/, "Username: 3–20 letters, numbers, or underscores.");

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(60),
    username: usernameSchema,
    password: z.string().min(8, "Password must be at least 8 characters.").max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, "Enter your password.").max(72),
});

export const reviewRequestSchema = z.object({
  action: z.enum(["approve", "reject", "unpublish"]),
  edits: z
    .object({
      headline: z.string().trim().min(5).max(160),
      body: z.string().trim().min(20).max(900),
      explanation: z.string().trim().min(20).max(700),
    })
    .optional(),
});

/** First human-friendly message from a Zod error. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
