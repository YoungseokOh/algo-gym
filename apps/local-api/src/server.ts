import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { ensureWorkspace } from "@algo-gym/workspace";
import { coachRoutes } from "./routes/coach.ts";
import { healthRoutes } from "./routes/health.ts";
import { leetcodeStatsRoutes } from "./routes/leetcodeStats.ts";
import { problemRoutes } from "./routes/problems.ts";
import { settingsRoutes } from "./routes/settings.ts";
import { getProjectRoot } from "./lib/projectRoot.ts";
import { loadWorkspaceEnv } from "./lib/loadWorkspaceEnv.ts";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    allowHeaders: ["content-type"],
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"]
  })
);

app.route("/api", healthRoutes);
app.route("/api", problemRoutes);
app.route("/api", coachRoutes);
app.route("/api", settingsRoutes);
app.route("/api", leetcodeStatsRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));

const port = Number(process.env.PORT ?? 8787);
await ensureWorkspace(getProjectRoot());
await loadWorkspaceEnv();

serve(
  {
    fetch: app.fetch,
    port
  },
  (info) => {
    console.log(`algo-gym local-api listening on http://localhost:${info.port}`);
  }
);
