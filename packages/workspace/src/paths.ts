import { mkdir } from "node:fs/promises";
import path from "node:path";

export type WorkspacePaths = {
  root: string;
  problemsDir: string;
  patternsDir: string;
  weeklyDir: string;
  dataDir: string;
  configPath: string;
  envPath: string;
};

export function getWorkspacePaths(projectRoot: string): WorkspacePaths {
  const root = path.join(projectRoot, "workspace");
  return {
    root,
    problemsDir: path.join(root, "content", "problems", "leetcode"),
    patternsDir: path.join(root, "content", "patterns"),
    weeklyDir: path.join(root, "content", "weekly"),
    dataDir: path.join(root, "data"),
    configPath: path.join(root, "config.yaml"),
    envPath: path.join(root, ".env")
  };
}

export async function ensureWorkspaceDirs(projectRoot: string): Promise<WorkspacePaths> {
  const paths = getWorkspacePaths(projectRoot);
  await Promise.all(
    [paths.problemsDir, paths.patternsDir, paths.weeklyDir, paths.dataDir].map((dir) =>
      mkdir(dir, { recursive: true })
    )
  );
  return paths;
}
