export type ProblemSource = "leetcode";

export type ProblemStatus = "todo" | "solved" | "failed" | "review";

export type ProblemDifficulty = "Easy" | "Medium" | "Hard" | "";

export type ProblemSections = {
  summary: string;
  approach: string;
  stuckPoint: string;
  code: string;
  learned: string;
  aiReviews: string;
};

export type ProblemLog = {
  source: ProblemSource;
  title: string;
  titleSlug: string;
  url: string;
  difficulty: ProblemDifficulty;
  tags: string[];
  status: ProblemStatus;
  durationMinutes?: number;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  nextReviewAt?: string;
  sections: ProblemSections;
  filePath?: string;
  isSample?: boolean;
};

export type ProblemLogInput = Omit<ProblemLog, "sections"> & {
  sections?: Partial<ProblemSections>;
};

export type LocalStats = {
  totalProblems: number;
  byStatus: Record<string, number>;
  byDifficulty: Record<string, number>;
  byTag: Record<string, number>;
  averageDurationMinutes?: number;
  reviewQueueCount: number;
  failedToSolvedConversionRate?: number;
  recentProblems: ProblemLog[];
  weakTags: Array<{
    tag: string;
    failed: number;
    solved: number;
    score: number;
  }>;
};

export type ReviewQueueItem = {
  title: string;
  titleSlug: string;
  status: ProblemStatus;
  difficulty: ProblemDifficulty;
  nextReviewAt?: string;
  updatedAt: string;
};

export const emptyProblemSections: ProblemSections = {
  summary: "",
  approach: "",
  stuckPoint: "",
  code: "",
  learned: "",
  aiReviews: ""
};
