import { Hono } from "hono";

export const healthRoutes = new Hono().get("/health", (c) => {
  return c.json({
    ok: true,
    service: "algo-gym local-api",
    time: new Date().toISOString()
  });
});
