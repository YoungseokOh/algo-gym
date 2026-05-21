import { Hono } from "hono";
import { z } from "zod";
import { generateStats } from "@algo-gym/core";
import { createProblemFromLeetCodeUrl, getProblemLog, listProblemLogs, updateProblemLog } from "../lib/problemStore.ts";

const createProblemSchema = z.object({
  url: z.string().min(1),
  difficulty: z.union([z.literal("Easy"), z.literal("Medium"), z.literal("Hard"), z.literal("")]).optional(),
  tags: z.array(z.string()).default([]),
  status: z.union([z.literal("todo"), z.literal("solved"), z.literal("failed"), z.literal("review")]).default("todo")
});

const patchProblemSchema = z.object({
  title: z.string().optional(),
  url: z.string().optional(),
  difficulty: z.union([z.literal("Easy"), z.literal("Medium"), z.literal("Hard"), z.literal("")]).optional(),
  tags: z.array(z.string()).optional(),
  status: z.union([z.literal("todo"), z.literal("solved"), z.literal("failed"), z.literal("review")]).optional(),
  durationMinutes: z.number().nullable().optional(),
  attempts: z.number().int().nonnegative().optional(),
  nextReviewAt: z.string().nullable().optional(),
  sections: z
    .object({
      summary: z.string().optional(),
      approach: z.string().optional(),
      stuckPoint: z.string().optional(),
      code: z.string().optional(),
      learned: z.string().optional(),
      aiReviews: z.string().optional()
    })
    .optional()
});

export const problemRoutes = new Hono()
  .get("/problems", async (c) => {
    const problems = await listProblemLogs();
    return c.json({ problems });
  })
  .get("/stats", async (c) => {
    const problems = await listProblemLogs();
    return c.json({ stats: generateStats(problems) });
  })
  .post("/problems/create-from-leetcode-url", async (c) => {
    const body = createProblemSchema.parse(await c.req.json());
    try {
      const problem = await createProblemFromLeetCodeUrl(body);
      return c.json({ problem }, 201);
    } catch (error) {
      const existing = error instanceof Error && "existing" in error ? (error as { existing?: unknown }).existing : undefined;
      const message = error instanceof Error ? error.message : "Failed to create problem.";
      const status = message.includes("already exists") ? 409 : 400;
      return c.json({ error: message, existing }, status);
    }
  })
  .get("/problems/:titleSlug", async (c) => {
    try {
      const problem = await getProblemLog(c.req.param("titleSlug"));
      return c.json({ problem });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Problem not found." }, 404);
    }
  })
  .patch("/problems/:titleSlug", async (c) => {
    const patch = patchProblemSchema.parse(await c.req.json());
    try {
      const problem = await updateProblemLog(c.req.param("titleSlug"), {
        ...patch,
        durationMinutes: patch.durationMinutes ?? undefined,
        nextReviewAt: patch.nextReviewAt ?? undefined
      });
      return c.json({ problem });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Failed to update problem." }, 400);
    }
  });
