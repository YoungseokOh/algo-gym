import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseProblemLog } from "@algo-gym/core";
import { ensureWorkspace } from "@algo-gym/workspace";

const paths = await ensureWorkspace(process.cwd());
const entries = await readdir(paths.problemsDir, { withFileTypes: true }).catch(() => []);
const problems = [];

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
  const filePath = path.join(paths.problemsDir, entry.name);
  problems.push(parseProblemLog(await readFile(filePath, "utf8"), filePath));
}

const indexPath = path.join(paths.dataDir, "index.json");
await writeFile(indexPath, JSON.stringify({ generatedAt: new Date().toISOString(), problems }, null, 2), "utf8");
console.log(`Wrote ${indexPath}`);
