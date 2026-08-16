import { Hono } from "hono";
import type { HealthResponse } from "@ascent/types";

export interface AppDeps {
  checkDatabase: () => Promise<boolean>;
}

export function createApp(deps: AppDeps) {
  const app = new Hono();

  app.get("/health", async (c) => {
    const connected = await deps.checkDatabase();

    const body: HealthResponse = {
      status: connected ? "online" : "offline",
      database: connected ? "connected" : "unavailable",
      timestamp: new Date().toISOString(),
    };

    return c.json(body, 200);
  });

  return app;
}
