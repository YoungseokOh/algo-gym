import type { LocalStats, ProblemLog } from "./types.ts";
import { generateReviewQueue } from "./generateReviewQueue.ts";

export function generateStats(problems: ProblemLog[]): LocalStats {
  const byStatus: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const byTag: Record<string, number> = {};
  const durations: number[] = [];

  for (const problem of problems) {
    byStatus[problem.status] = (byStatus[problem.status] ?? 0) + 1;
    if (problem.difficulty) {
      byDifficulty[problem.difficulty] = (byDifficulty[problem.difficulty] ?? 0) + 1;
    }
    for (const tag of problem.tags) {
      byTag[tag] = (byTag[tag] ?? 0) + 1;
    }
    if (typeof problem.durationMinutes === "number" && Number.isFinite(problem.durationMinutes)) {
      durations.push(problem.durationMinutes);
    }
  }

  const recentProblems = [...problems]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8);

  const weakTags = Object.keys(byTag)
    .map((tag) => {
      const tagged = problems.filter((problem) => problem.tags.includes(tag));
      const failed = tagged.filter((problem) => problem.status === "failed" || problem.status === "review").length;
      const solved = tagged.filter((problem) => problem.status === "solved").length;
      const score = failed * 2 - solved;
      return { tag, failed, solved, score };
    })
    .filter((tag) => tag.failed > 0 || tag.score > 0)
    .sort((a, b) => b.score - a.score || b.failed - a.failed)
    .slice(0, 8);

  return {
    totalProblems: problems.length,
    byStatus,
    byDifficulty,
    byTag,
    averageDurationMinutes: durations.length
      ? Math.round((durations.reduce((sum, value) => sum + value, 0) / durations.length) * 10) / 10
      : undefined,
    reviewQueueCount: generateReviewQueue(problems).length,
    recentProblems,
    weakTags
  };
}
