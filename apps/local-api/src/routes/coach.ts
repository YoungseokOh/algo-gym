import { Hono } from "hono";
import { z } from "zod";
import { buildCoachPrompt, coachModeSchema, createChatCompletion, parseCoachReview } from "@algo-gym/llm";
import { readConfig } from "@algo-gym/workspace";
import { getProblemLog, saveAiReview } from "../lib/problemStore.ts";
import { getProjectRoot } from "../lib/projectRoot.ts";

const coachRequestSchema = z.object({
  mode: coachModeSchema.default("hint"),
  save: z.boolean().default(false)
});

export const coachRoutes = new Hono().post("/coach/:titleSlug", async (c) => {
  const body = coachRequestSchema.parse(await c.req.json());
  const problem = await getProblemLog(c.req.param("titleSlug"));
  const config = await readConfig(getProjectRoot());
  const apiKey = process.env[config.llm.apiKeyEnv] || undefined;

  try {
    const raw = await createChatCompletion(
      {
        baseUrl: config.llm.baseUrl,
        model: config.llm.model,
        apiKey,
        temperature: config.llm.temperature
      },
      buildCoachPrompt(problem, body.mode)
    );
    const parsed = parseCoachReview(raw, body.mode);
    const savedProblem = body.save ? await saveAiReview(problem.titleSlug, body.mode, parsed.text) : undefined;

    return c.json({
      mode: body.mode,
      review: parsed.parsed,
      text: parsed.text,
      saved: Boolean(savedProblem),
      problem: savedProblem
    });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Coach request failed.",
        hint: "Check Settings -> LLM Settings. Local Ollama defaults to http://localhost:11434/v1."
      },
      502
    );
  }
});
