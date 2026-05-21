import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  appendAiReview,
  createProblemLogMarkdown,
  mergeProblemLog,
  parseProblemLog,
  writeProblemLogMarkdown,
  type ProblemLogPatch,
  type ProblemLog
} from "@algo-gym/core";
import { parseLeetCodeUrl, slugToTitle } from "@algo-gym/leetcode";
import { ensureWorkspace, getWorkspacePaths } from "@algo-gym/workspace";
import { getProjectRoot } from "./projectRoot.ts";

export type CreateProblemInput = {
  url: string;
  difficulty?: "Easy" | "Medium" | "Hard" | "";
  tags?: string[];
  status?: "todo" | "solved" | "failed" | "review";
};

export async function listProblemLogs(): Promise<ProblemLog[]> {
  const projectRoot = getProjectRoot();
  const paths = await ensureWorkspace(projectRoot);
  const workspaceFiles = await listMarkdownFiles(paths.problemsDir);
  const files = workspaceFiles.length > 0 ? workspaceFiles : await listMarkdownFiles(path.join(projectRoot, "content", "sample", "problems"));

  const logs = await Promise.all(
    files.map(async (filePath) => {
      const raw = await readFile(filePath, "utf8");
      const parsed = parseProblemLog(raw, filePath);
      return {
        ...parsed,
        isSample: filePath.includes(`${path.sep}content${path.sep}sample${path.sep}`)
      };
    })
  );

  return logs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.title.localeCompare(b.title));
}

export async function createProblemFromLeetCodeUrl(input: CreateProblemInput): Promise<ProblemLog> {
  const projectRoot = getProjectRoot();
  const paths = await ensureWorkspace(projectRoot);
  const parsedUrl = parseLeetCodeUrl(input.url);
  const filePath = path.join(paths.problemsDir, `${parsedUrl.titleSlug}.md`);

  if (await fileExists(filePath)) {
    const existing = await getProblemLog(parsedUrl.titleSlug);
    const error = new Error("This problem already exists.") as Error & { existing?: ProblemLog };
    error.existing = existing;
    throw error;
  }

  const markdown = createProblemLogMarkdown({
    title: slugToTitle(parsedUrl.titleSlug),
    titleSlug: parsedUrl.titleSlug,
    url: parsedUrl.url,
    difficulty: input.difficulty ?? "",
    tags: input.tags ?? [],
    status: input.status ?? "todo"
  });
  await writeFile(filePath, markdown, "utf8");
  return parseProblemLog(markdown, filePath);
}

export async function getProblemLog(titleSlug: string): Promise<ProblemLog> {
  const projectRoot = getProjectRoot();
  const workspacePath = path.join(getWorkspacePaths(projectRoot).problemsDir, `${titleSlug}.md`);
  const samplePath = path.join(projectRoot, "content", "sample", "problems", `${titleSlug}.md`);
  const filePath = (await fileExists(workspacePath)) ? workspacePath : samplePath;

  if (!(await fileExists(filePath))) {
    throw new Error("Problem log not found.");
  }

  const raw = await readFile(filePath, "utf8");
  return {
    ...parseProblemLog(raw, filePath),
    isSample: filePath === samplePath
  };
}

export async function updateProblemLog(titleSlug: string, patch: ProblemLogPatch): Promise<ProblemLog> {
  const problem = await getProblemLog(titleSlug);
  if (problem.isSample) {
    throw new Error("Sample problem logs are read-only. Add it to your workspace first.");
  }
  if (!problem.filePath) {
    throw new Error("Problem log file path is missing.");
  }

  const merged = mergeProblemLog(problem, patch);
  await writeFile(problem.filePath, writeProblemLogMarkdown(merged), "utf8");
  return merged;
}

export async function saveAiReview(titleSlug: string, mode: string, content: string): Promise<ProblemLog> {
  const problem = await getProblemLog(titleSlug);
  if (problem.isSample) {
    throw new Error("Sample problem logs are read-only. Add it to your workspace first.");
  }
  if (!problem.filePath) {
    throw new Error("Problem log file path is missing.");
  }

  const merged = appendAiReview(problem, mode, content);
  await writeFile(problem.filePath, writeProblemLogMarkdown(merged), "utf8");
  return merged;
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => path.join(dir, entry.name));
  } catch {
    return [];
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await readFile(filePath, "utf8");
    return true;
  } catch {
    return false;
  }
}
