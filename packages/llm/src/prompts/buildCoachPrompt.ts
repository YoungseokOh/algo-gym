import type { ProblemLog } from "@algo-gym/core";
import type { ChatMessage } from "../providers/openAICompatible.ts";
import type { CoachMode } from "../schemas/coachReviewSchema.ts";
import { complexityPrompt } from "./complexity.ts";
import { counterexamplePrompt } from "./counterexample.ts";
import { fullReviewPrompt } from "./fullReview.ts";
import { hintPrompt } from "./hint.ts";
import { reviewPrompt } from "./review.ts";

const modeInstructions: Record<CoachMode, string> = {
  hint: hintPrompt,
  review: reviewPrompt,
  complexity: complexityPrompt,
  counterexample: counterexamplePrompt,
  "full-review": fullReviewPrompt
};

export function buildCoachPrompt(problem: ProblemLog, mode: CoachMode): ChatMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are an algorithm training coach for a local-first LeetCode practice journal.",
        "You must not claim that you know the original LeetCode statement unless the user wrote that content in their own summary.",
        "You must not reproduce LeetCode problem statements, examples, constraints, official solutions, hidden tests, premium content, or discussion content.",
        "Default to hint-first coaching. Do not reveal a full solution unless the requested mode is full-review, and even then focus on the user's own notes and code.",
        "Review the user's thinking, ask useful questions, identify likely patterns, discuss complexity, and suggest the next practice action.",
        "Return strict JSON only. No markdown fences."
      ].join("\n")
    },
    {
      role: "user",
      content: [
        `Mode: ${mode}`,
        modeInstructions[mode],
        "",
        "Return this JSON shape:",
        JSON.stringify(
          {
            mode,
            summary: "short coaching summary",
            correctness: "unknown | likely-correct | partially-correct | likely-incorrect",
            mainIssue: "optional issue",
            missedPattern: "optional pattern",
            complexity: { time: "optional", space: "optional" },
            questions: ["question for the learner"],
            nextActions: ["next practice action"],
            content: "coach response for display"
          },
          null,
          2
        ),
        "",
        "Problem metadata:",
        JSON.stringify(
          {
            title: problem.title,
            titleSlug: problem.titleSlug,
            source: problem.source,
            url: problem.url,
            difficulty: problem.difficulty,
            tags: problem.tags,
            status: problem.status,
            durationMinutes: problem.durationMinutes,
            attempts: problem.attempts
          },
          null,
          2
        ),
        "",
        "User-written content only:",
        JSON.stringify(
          {
            summary: problem.sections.summary,
            approach: problem.sections.approach,
            stuckPoint: problem.sections.stuckPoint,
            code: problem.sections.code,
            learned: problem.sections.learned,
            priorAiReviews: problem.sections.aiReviews
          },
          null,
          2
        )
      ].join("\n")
    }
  ];
}
