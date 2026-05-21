import { readFile } from "node:fs/promises";
import { getWorkspacePaths } from "@algo-gym/workspace";
import { getProjectRoot } from "./projectRoot.ts";

export async function loadWorkspaceEnv(): Promise<void> {
  const envPath = getWorkspacePaths(getProjectRoot()).envPath;
  let raw = "";
  try {
    raw = await readFile(envPath, "utf8");
  } catch {
    return;
  }

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
