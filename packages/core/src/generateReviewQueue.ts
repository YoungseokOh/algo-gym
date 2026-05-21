import type { ProblemLog, ReviewQueueItem } from "./types.ts";

export function generateReviewQueue(problems: ProblemLog[], now = new Date()): ReviewQueueItem[] {
  const today = now.toISOString().slice(0, 10);

  return problems
    .filter((problem) => {
      if (problem.status === "review" || problem.status === "failed") return true;
      if (!problem.nextReviewAt) return false;
      return problem.nextReviewAt <= today;
    })
    .sort((a, b) => {
      const aDate = a.nextReviewAt ?? a.updatedAt;
      const bDate = b.nextReviewAt ?? b.updatedAt;
      return aDate.localeCompare(bDate);
    })
    .map((problem) => ({
      title: problem.title,
      titleSlug: problem.titleSlug,
      status: problem.status,
      difficulty: problem.difficulty,
      nextReviewAt: problem.nextReviewAt,
      updatedAt: problem.updatedAt
    }));
}
