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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * 손으로 고친 config.yaml이 깨져 있어도 앱이 멈추면 안 된다:
 * 파싱/검증 실패 시 기본값으로 폴백해 모든 엔드포인트가 계속 동작하고,
 * Settings에서 저장하면 writeConfig가 유효한 파일로 복구한다.
 */
export async function readConfig(projectRoot: string): Promise<WorkspaceConfig> {
  const { configPath } = getWorkspacePaths(projectRoot);
  let raw: string;
  try {
    raw = await readFile(configPath, "utf8");
  } catch {
    return defaultConfig;
  }

  try {
    const parsed: unknown = parse(raw) ?? {};
    return configSchema.parse(parsed);
  } catch (error) {
    const reason = error instanceof Error ? error.message.split("\n")[0] : String(error);
    console.warn(`workspace/config.yaml is invalid (${reason}); falling back to defaults. Save settings to repair it.`);
    return defaultConfig;
  }
}

export async function writeConfig(input: unknown, projectRoot: string): Promise<WorkspaceConfig> {
  const current = await readConfig(projectRoot);
  const patch = isRecord(input) ? input : {};
  // 섹션 목록을 스키마에서 끌어와, 섹션이 추가돼도 머지에서 빠지지 않게 한다.
  const sections = Object.keys(configSchema.shape) as Array<keyof WorkspaceConfig>;
  const merged = configSchema.parse(
    Object.fromEntries(
      sections.map((section) => [
        section,
        { ...current[section], ...(isRecord(patch[section]) ? patch[section] : {}) }
      ])
    )
  );

  const { configPath } = await ensureWorkspaceDirs(projectRoot);
  await writeFile(configPath, stringify(merged), "utf8");
  return merged;
}

/** zod 검증 실패를 사용자에게 보여줄 수 있는 한 줄 메시지로 바꾼다. */
export function formatConfigError(error: unknown): string | undefined {
  if (!(error instanceof z.ZodError)) return undefined;
  return error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
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
