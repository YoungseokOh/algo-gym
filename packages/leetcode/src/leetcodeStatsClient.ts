import { normalizeLeetCodeStats, type LeetCodeRemoteStats } from "./normalizeLeetCodeStats.ts";

const allowedEndpointBuilders = {
  solved: (username: string) => `/${username}/solved`,
  submissions: (username: string) => `/${username}/submission?limit=20`,
  acceptedSubmissions: (username: string) => `/${username}/acSubmission?limit=20`,
  calendar: (username: string) => `/${username}/calendar`,
  skill: (username: string) => `/${username}/skill`,
  language: (username: string) => `/${username}/language`,
  contest: (username: string) => `/${username}/contest`,
  progress: (username: string) => `/${username}/progress`,
  profile: (username: string) => `/${username}/profile`
} as const;

export type LeetCodeStatsClientOptions = {
  baseUrl: string;
  username: string;
  timeoutMs?: number;
};

export async function fetchLeetCodeStats(options: LeetCodeStatsClientOptions): Promise<LeetCodeRemoteStats> {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const username = encodeURIComponent(options.username.trim());
  if (!username) {
    throw new Error("LeetCode username is required.");
  }

  const entries = await Promise.all(
    Object.entries(allowedEndpointBuilders).map(async ([key, buildPath]) => {
      try {
        const data = await getJson(`${baseUrl}${buildPath(username)}`, options.timeoutMs ?? 10000);
        return [key, data] as const;
      } catch (error) {
        return [key, { error: error instanceof Error ? error.message : "Failed to fetch endpoint" }] as const;
      }
    })
  );

  return normalizeLeetCodeStats(options.username, Object.fromEntries(entries));
}

async function getJson(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}
