import { Hono } from "hono";
import { createChatCompletion } from "@algo-gym/llm";
import { readConfig, runPrivacyGuard, writeConfig } from "@algo-gym/workspace";
import { getProjectRoot } from "../lib/projectRoot.ts";

export const settingsRoutes = new Hono()
  .get("/settings", async (c) => {
    return c.json({ config: await readConfig(getProjectRoot()) });
  })
  .patch("/settings", async (c) => {
    const config = await writeConfig(await c.req.json(), getProjectRoot());
    return c.json({ config });
  })
  .post("/llm/test", async (c) => {
    const config = await readConfig(getProjectRoot());
    const apiKey = process.env[config.llm.apiKeyEnv] || undefined;

    try {
      const text = await createChatCompletion(
        {
          baseUrl: config.llm.baseUrl,
          model: config.llm.model,
          apiKey,
          temperature: 0,
          timeoutMs: 20000
        },
        [
          {
            role: "system",
            content: "Reply with a short JSON object like {\"ok\":true,\"message\":\"connected\"}."
          },
          {
            role: "user",
            content: "Test the connection."
          }
        ]
      );
      return c.json({ ok: true, text });
    } catch (error) {
      return c.json({ ok: false, error: error instanceof Error ? error.message : "LLM test failed." }, 502);
    }
  })
  .post("/privacy/guard", async (c) => {
    const result = await runPrivacyGuard(getProjectRoot());
    return c.json(result, result.ok ? 200 : 400);
  });
