import type { AppConfig, CoachMode, LocalStats, ProblemLog } from "./types.ts";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export async function getHealth(): Promise<unknown> {
  return apiGet("/api/health");
}

export async function listProblems(): Promise<ProblemLog[]> {
  const data = await apiGet<{ problems: ProblemLog[] }>("/api/problems");
  return data.problems;
}

export async function getStats(): Promise<LocalStats> {
  const data = await apiGet<{ stats: LocalStats }>("/api/stats");
  return data.stats;
}

export async function createProblem(payload: {
  url: string;
  difficulty?: string;
  tags: string[];
  status: string;
}): Promise<{ problem?: ProblemLog; error?: string; existing?: ProblemLog }> {
  return apiJson("/api/problems/create-from-leetcode-url", "POST", payload);
}

export async function getProblem(titleSlug: string): Promise<ProblemLog> {
  const data = await apiGet<{ problem: ProblemLog }>(`/api/problems/${titleSlug}`);
  return data.problem;
}

export async function updateProblem(titleSlug: string, payload: Partial<ProblemLog>): Promise<ProblemLog> {
  const data = await apiJson<{ problem: ProblemLog }>(`/api/problems/${titleSlug}`, "PATCH", payload);
  return data.problem;
}

export async function requestCoach(
  titleSlug: string,
  mode: CoachMode,
  save: boolean
): Promise<{ text?: string; review?: unknown; error?: string; problem?: ProblemLog }> {
  return apiJson(`/api/coach/${titleSlug}`, "POST", { mode, save });
}

export async function getConfig(): Promise<AppConfig> {
  const data = await apiGet<{ config: AppConfig }>("/api/settings");
  return data.config;
}

export async function saveConfig(config: Partial<AppConfig>): Promise<AppConfig> {
  const data = await apiJson<{ config: AppConfig }>("/api/settings", "PATCH", config);
  return data.config;
}

export async function testLlm(): Promise<{ ok: boolean; text?: string; error?: string }> {
  return apiJson("/api/llm/test", "POST", {});
}

export async function getLeetCodeStats(): Promise<{ stats: unknown; message?: string }> {
  return apiGet("/api/leetcode-stats");
}

export async function syncLeetCodeStats(): Promise<{ stats?: unknown; error?: string }> {
  return apiJson("/api/leetcode-stats/sync", "POST", {});
}

export async function runPrivacyGuard(): Promise<{ ok: boolean; checks: Array<{ name: string; ok: boolean; message: string }> }> {
  return apiJson("/api/privacy/guard", "POST", {});
}

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  return parseResponse<T>(response);
}

async function apiJson<T>(path: string, method: "POST" | "PATCH", payload: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseResponse<T>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok && !data.error) {
    throw new Error(`Request failed: HTTP ${response.status}`);
  }
  return data;
}
