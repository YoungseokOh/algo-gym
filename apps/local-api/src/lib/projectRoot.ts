import { fileURLToPath } from "node:url";
import path from "node:path";

export function getProjectRoot(): string {
  return process.env.ALGO_GYM_ROOT ?? path.resolve(fileURLToPath(new URL("../../../..", import.meta.url)));
}
