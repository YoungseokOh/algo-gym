export type LeetCodeRemoteStats = {
  username: string;
  syncedAt: string;
  solved?: {
    total?: number;
    easy?: number;
    medium?: number;
    hard?: number;
  };
  submissions?: Array<{
    title?: string;
    titleSlug?: string;
    statusDisplay?: string;
    lang?: string;
    timestamp?: string;
  }>;
  acceptedSubmissions?: Array<{
    title?: string;
    titleSlug?: string;
    lang?: string;
    timestamp?: string;
  }>;
  calendar?: Record<string, number>;
  languageStats?: Array<{
    language: string;
    count: number;
  }>;
  skillStats?: unknown;
  contest?: unknown;
  progress?: unknown;
  profile?: unknown;
  raw?: unknown;
};

type RawStatsBundle = {
  solved?: unknown;
  submissions?: unknown;
  acceptedSubmissions?: unknown;
  calendar?: unknown;
  skill?: unknown;
  language?: unknown;
  contest?: unknown;
  progress?: unknown;
  profile?: unknown;
};

export function normalizeLeetCodeStats(username: string, bundle: RawStatsBundle): LeetCodeRemoteStats {
  return {
    username,
    syncedAt: new Date().toISOString(),
    solved: normalizeSolved(bundle.solved),
    submissions: normalizeSubmissions(bundle.submissions, false),
    acceptedSubmissions: normalizeSubmissions(bundle.acceptedSubmissions, true),
    calendar: normalizeCalendar(bundle.calendar),
    languageStats: normalizeLanguageStats(bundle.language),
    skillStats: bundle.skill,
    contest: bundle.contest,
    progress: bundle.progress,
    profile: bundle.profile,
    raw: bundle
  };
}

function normalizeSolved(raw: unknown): LeetCodeRemoteStats["solved"] {
  const obj = asRecord(raw);
  if (!obj) return undefined;

  return {
    total: numberFrom(obj.totalSolved ?? obj.solvedProblem ?? obj.solved),
    easy: numberFrom(obj.easySolved ?? obj.easy),
    medium: numberFrom(obj.mediumSolved ?? obj.medium),
    hard: numberFrom(obj.hardSolved ?? obj.hard)
  };
}

function normalizeSubmissions(raw: unknown, acceptedOnly: boolean): LeetCodeRemoteStats["submissions"] {
  const array = findFirstArray(raw, ["submission", "submissions", "data", "recentSubmissionList", "recentAcSubmissionList"]);
  if (!array) return undefined;

  return array
    .map(asRecord)
    .filter(isRecord)
    .slice(0, 20)
    .map((item) => ({
      title: stringFrom(item.title),
      titleSlug: stringFrom(item.titleSlug),
      statusDisplay: acceptedOnly ? "Accepted" : stringFrom(item.statusDisplay),
      lang: stringFrom(item.lang ?? item.language),
      timestamp: stringFrom(item.timestamp)
    }));
}

function normalizeCalendar(raw: unknown): Record<string, number> | undefined {
  const obj = asRecord(raw);
  if (!obj) return undefined;

  const candidate = obj.submissionCalendar ?? obj.calendar ?? raw;
  if (typeof candidate === "string") {
    try {
      return normalizeCalendar(JSON.parse(candidate));
    } catch {
      return undefined;
    }
  }

  const calendar = asRecord(candidate);
  if (!calendar) return undefined;

  const normalized: Record<string, number> = {};
  for (const [key, value] of Object.entries(calendar)) {
    const count = numberFrom(value);
    if (count !== undefined) normalized[key] = count;
  }
  return normalized;
}

function normalizeLanguageStats(raw: unknown): LeetCodeRemoteStats["languageStats"] {
  const array = findFirstArray(raw, ["languageProblemCount", "languageStats", "languages", "data"]);
  if (!array) return undefined;

  return array
    .map(asRecord)
    .filter(isRecord)
    .map((item) => ({
      language: stringFrom(item.languageName ?? item.language) ?? "Unknown",
      count: numberFrom(item.problemsSolved ?? item.count ?? item.solved) ?? 0
    }))
    .filter((item) => item.count > 0);
}

function findFirstArray(raw: unknown, keys: string[]): unknown[] | undefined {
  if (Array.isArray(raw)) return raw;
  const obj = asRecord(raw);
  if (!obj) return undefined;

  for (const key of keys) {
    const value = obj[key];
    if (Array.isArray(value)) return value;
    const nested = asRecord(value);
    if (nested) {
      const nestedArray = findFirstArray(nested, keys);
      if (nestedArray) return nestedArray;
    }
  }

  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

function isRecord(value: Record<string, unknown> | undefined): value is Record<string, unknown> {
  return Boolean(value);
}

function stringFrom(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function numberFrom(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}
