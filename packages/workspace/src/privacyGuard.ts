import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { getWorkspacePaths } from "./paths.ts";

export type PrivacyCheck = {
  name: string;
  ok: boolean;
  message: string;
};

export type PrivacyGuardResult = {
  ok: boolean;
  checks: PrivacyCheck[];
};

const forbiddenHeadingPattern = /^#{1,3}\s+(problem statement|official solution|editorial|discussion|hidden tests?)\b/im;
const secretPattern = /\b(sk-[a-zA-Z0-9]{16,}|api[_-]?key\s*[:=]\s*["']?[a-zA-Z0-9_-]{16,})/i;

export async function runPrivacyGuard(projectRoot: string): Promise<PrivacyGuardResult> {
  const paths = getWorkspacePaths(projectRoot);
  const checks: PrivacyCheck[] = [];

  const gitignore = await readFileSafe(path.join(projectRoot, ".gitignore"));
  const gitignoreLines = gitignore.split("\n").map((line) => line.trim());

  checks.push({
    name: "workspace gitignored",
    ok: gitignoreLines.some((line) => line === "workspace/" || line === "/workspace/" || line === "/workspace"),
    message: "workspace/ must stay out of git so personal logs remain private."
  });

  checks.push({
    name: "env files gitignored",
    ok: gitignoreLines.includes(".env") && gitignoreLines.some((line) => line === ".env.*"),
    message: ".env and .env.* must be gitignored so API keys are never committed."
  });

  const configRaw = await readFileSafe(paths.configPath);
  checks.push({
    name: "no secrets in config",
    ok: !secretPattern.test(configRaw),
    message: "workspace/config.yaml must reference API keys via env var names only."
  });

  const problemFindings = await scanProblemLogs(paths.problemsDir);
  checks.push({
    name: "no scraped problem content",
    ok: problemFindings.length === 0,
    message:
      problemFindings.length === 0
        ? "Problem logs contain only personal notes."
        : `Remove scraped/official content from: ${problemFindings.join(", ")}`
  });

  return {
    ok: checks.every((check) => check.ok),
    checks
  };
}

async function scanProblemLogs(problemsDir: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(problemsDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const findings: string[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const raw = await readFileSafe(path.join(problemsDir, entry.name));
    if (forbiddenHeadingPattern.test(raw)) {
      findings.push(entry.name);
    }
  }
  return findings;
}

async function readFileSafe(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return "";
  }
}
