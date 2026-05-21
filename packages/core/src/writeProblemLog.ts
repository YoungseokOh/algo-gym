import matter from "gray-matter";
import type { ProblemLog, ProblemLogInput, ProblemSections } from "./types.ts";
import { emptyProblemSections } from "./types.ts";

export type CreateProblemLogParams = {
  title: string;
  titleSlug: string;
  url: string;
  difficulty?: "Easy" | "Medium" | "Hard" | "";
  tags?: string[];
  status?: "todo" | "solved" | "failed" | "review";
  createdAt?: string;
};

export function createProblemLogMarkdown(params: CreateProblemLogParams): string {
  const today = params.createdAt ?? new Date().toISOString().slice(0, 10);
  return writeProblemLogMarkdown({
    source: "leetcode",
    title: params.title,
    titleSlug: params.titleSlug,
    url: params.url,
    difficulty: params.difficulty ?? "",
    tags: normalizeTags(params.tags ?? []),
    status: params.status ?? "todo",
    attempts: 0,
    createdAt: today,
    updatedAt: today,
    sections: {
      summary: "Write the problem in your own words.",
      approach: "",
      stuckPoint: "",
      code: "",
      learned: "",
      aiReviews: ""
    }
  });
}

export function writeProblemLogMarkdown(problem: ProblemLogInput | ProblemLog): string {
  const sections: ProblemSections = {
    ...emptyProblemSections,
    ...(problem.sections ?? {})
  };

  const frontmatter = {
    source: problem.source,
    title: problem.title,
    titleSlug: problem.titleSlug,
    url: problem.url,
    difficulty: problem.difficulty,
    tags: normalizeTags(problem.tags),
    status: problem.status,
    durationMinutes: problem.durationMinutes ?? null,
    attempts: problem.attempts ?? 0,
    createdAt: problem.createdAt,
    updatedAt: problem.updatedAt,
    nextReviewAt: problem.nextReviewAt ?? null
  };

  const body = [
    "# My Problem Summary",
    sections.summary,
    "",
    "# My Approach",
    sections.approach,
    "",
    "# Stuck Point",
    sections.stuckPoint,
    "",
    "# Code",
    "```ts",
    sections.code,
    "```",
    "",
    "# What I Learned",
    sections.learned,
    "",
    "# AI Reviews",
    sections.aiReviews
  ].join("\n");

  return matter.stringify(body, frontmatter).replace(/\n{3,}/g, "\n\n");
}

export type ProblemLogPatch = Partial<Omit<ProblemLog, "sections">> & {
  sections?: Partial<ProblemSections>;
};

export function mergeProblemLog(base: ProblemLog, patch: ProblemLogPatch): ProblemLog {
  return {
    ...base,
    ...patch,
    tags: patch.tags ? normalizeTags(patch.tags) : base.tags,
    sections: {
      ...base.sections,
      ...(patch.sections ?? {})
    },
    updatedAt: new Date().toISOString().slice(0, 10)
  };
}

export function appendAiReview(problem: ProblemLog, mode: string, content: string): ProblemLog {
  const stamp = new Date().toISOString();
  const entry = [`## ${stamp} - ${mode}`, "", content.trim()].join("\n");
  const previous = problem.sections.aiReviews.trim();
  return mergeProblemLog(problem, {
    sections: {
      ...problem.sections,
      aiReviews: previous ? `${previous}\n\n${entry}` : entry
    }
  });
}

function normalizeTags(tags: string[]): string[] {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}
