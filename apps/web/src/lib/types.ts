import type { LocalStats, ProblemLog, ProblemStatus } from "@algo-gym/core";

export type { LocalStats, ProblemLog, ProblemStatus };

export type AppConfig = {
  llm: {
    provider: string;
    baseUrl: string;
    model: string;
    apiKeyEnv: string;
    temperature: number;
    streaming: boolean;
  };
  coach: {
    defaultMode: string;
    revealSolutionByDefault: boolean;
    minThinkingMinutes: number;
  };
  leetcodeStats: {
    enabled: boolean;
    username: string;
    provider: string;
    baseUrl: string;
    cacheTtlMinutes: number;
  };
};

export type CoachMode = "hint" | "review" | "complexity" | "counterexample" | "full-review";
