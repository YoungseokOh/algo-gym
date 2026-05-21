import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Hono } from "hono";
import { fetchLeetCodeStats } from "@algo-gym/leetcode";
import { ensureWorkspace, getWorkspacePaths, readConfig } from "@algo-gym/workspace";
import { getProjectRoot } from "../lib/projectRoot.ts";

export const leetcodeStatsRoutes = new Hono()
  .get("/leetcode-stats", async (c) => {
    const cache = await readCache();
    if (!cache) {
      return c.json({ stats: null, message: "No cached LeetCode stats yet." });
    }
    return c.json({ stats: cache });
  })
  .post("/leetcode-stats/sync", async (c) => {
    const projectRoot = getProjectRoot();
    const config = await readConfig(projectRoot);
    if (!config.leetcodeStats.enabled || !config.leetcodeStats.username.trim()) {
      return c.json(
        {
          error: "Enable LeetCode stats and set a username in Settings first."
        },
        400
      );
    }

    try {
      const stats = await fetchLeetCodeStats({
        baseUrl: config.leetcodeStats.baseUrl,
        username: config.leetcodeStats.username
      });
      await writeCache(stats);
      return c.json({ stats });
    } catch (error) {
      return c.json(
        {
          error: error instanceof Error ? error.message : "Failed to sync LeetCode stats.",
          stats: await readCache()
        },
        502
      );
    }
  });

async function readCache(): Promise<unknown | null> {
  try {
    const filePath = path.join(getWorkspacePaths(getProjectRoot()).dataDir, "leetcode-stats.json");
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

async function writeCache(stats: unknown): Promise<void> {
  const projectRoot = getProjectRoot();
  await ensureWorkspace(projectRoot);
  const filePath = path.join(getWorkspacePaths(projectRoot).dataDir, "leetcode-stats.json");
  await writeFile(filePath, JSON.stringify(stats, null, 2), "utf8");
}
