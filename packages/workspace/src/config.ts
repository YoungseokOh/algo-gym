import { readFile, writeFile } from "node:fs/promises";
import { parse, stringify } from "yaml";
import { z } from "zod";
import { ensureWorkspaceDirs, getWorkspacePaths } from "./paths.ts";

const configSchema = z.object({
  llm: z
    .object({
      provider: z.string().default("openai-compatible"),
      baseUrl: z.string().default("http://localhost:11434/v1"),
      model: z.string().default("qwen3:14b"),
      apiKeyEnv: z.string().default("ALGO_GYM_LLM_API_KEY"),
      temperature: z.number().min(0).max(2).default(0.2),
      streaming: z.boolean().default(false)
    })
    .default({}),
  coach: z
    .object({
      defaultMode: z.string().default("hint"),
      revealSolutionByDefault: z.boolean().default(false),
      minThinkingMinutes: z.number().min(0).default(15)
    })
    .default({}),
  leetcodeStats: z
    .object({
      enabled: z.boolean().default(false),
      username: z.string().default(""),
      provider: z.string().default("alfa-leetcode-api"),
      baseUrl: z.string().default("https://alfa-leetcode-api.onrender.com"),
      cacheTtlMinutes: z.number().min(1).default(60)
    })
    .default({})
});

export type WorkspaceConfig = z.infer<typeof configSchema>;

export const defaultConfig: WorkspaceConfig = configSchema.parse({});

export async function readConfig(projectRoot: string): Promise<WorkspaceConfig> {
  const { configPath } = getWorkspacePaths(projectRoot);
  let raw: string;
  try {
    raw = await readFile(configPath, "utf8");
  } catch {
    return defaultConfig;
  }

  const parsed: unknown = parse(raw) ?? {};
  return configSchema.parse(parsed);
}

export async function writeConfig(input: unknown, projectRoot: string): Promise<WorkspaceConfig> {
  const current = await readConfig(projectRoot);
  const patch = (input ?? {}) as Partial<Record<keyof WorkspaceConfig, object>>;
  const merged = configSchema.parse({
    llm: { ...current.llm, ...(patch.llm ?? {}) },
    coach: { ...current.coach, ...(patch.coach ?? {}) },
    leetcodeStats: { ...current.leetcodeStats, ...(patch.leetcodeStats ?? {}) }
  });

  const { configPath } = await ensureWorkspaceDirs(projectRoot);
  await writeFile(configPath, stringify(merged), "utf8");
  return merged;
}

export async function ensureWorkspace(projectRoot: string) {
  const paths = await ensureWorkspaceDirs(projectRoot);
  try {
    await readFile(paths.configPath, "utf8");
  } catch {
    await writeFile(paths.configPath, stringify(defaultConfig), "utf8");
  }
  return paths;
}
