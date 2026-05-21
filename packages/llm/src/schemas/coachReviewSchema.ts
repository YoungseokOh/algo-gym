import { z } from "zod";

export const coachModeSchema = z.enum(["hint", "review", "complexity", "counterexample", "full-review"]);

export const coachReviewSchema = z.object({
  mode: coachModeSchema,
  summary: z.string(),
  correctness: z.enum(["unknown", "likely-correct", "partially-correct", "likely-incorrect"]),
  mainIssue: z.string().optional(),
  missedPattern: z.string().optional(),
  complexity: z
    .object({
      time: z.string().optional(),
      space: z.string().optional()
    })
    .optional(),
  questions: z.array(z.string()).default([]),
  nextActions: z.array(z.string()).default([]),
  content: z.string()
});

export type CoachMode = z.infer<typeof coachModeSchema>;
export type CoachReview = z.infer<typeof coachReviewSchema>;

export function parseCoachReview(raw: string, mode: CoachMode): { parsed?: CoachReview; text: string } {
  const trimmed = raw.trim();
  const jsonCandidate = extractJson(trimmed);

  if (jsonCandidate) {
    const parsedJson = safeJson(jsonCandidate);
    const parsed = coachReviewSchema.safeParse(parsedJson);
    if (parsed.success) {
      return { parsed: parsed.data, text: parsed.data.content };
    }
  }

  return { text: trimmed || fallbackText(mode) };
}

function extractJson(raw: string): string | undefined {
  if (raw.startsWith("{") && raw.endsWith("}")) return raw;
  const fenced = /```(?:json)?\s*([\s\S]*?)\s*```/.exec(raw);
  if (fenced?.[1]?.trim().startsWith("{")) return fenced[1].trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  return start >= 0 && end > start ? raw.slice(start, end + 1) : undefined;
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function fallbackText(mode: CoachMode): string {
  return `No ${mode} response was returned by the configured model.`;
}
