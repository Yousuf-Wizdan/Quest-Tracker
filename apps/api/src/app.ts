import { Hono } from "hono";
import type { HealthResponse } from "@ascent/types";
import type { createRepositories } from "./repositories";
import { createAuthRoutes } from "./auth-routes";
import { seedDemoAccount } from "./seed";

export interface AppDeps {
  checkDatabase: () => Promise<boolean>;
  repos: ReturnType<typeof createRepositories>;
  jwtSecret: string;
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

  const authRoutes = createAuthRoutes(deps.repos, {
    jwtSecret: deps.jwtSecret,
    accessTokenTtlSeconds: 900,
    refreshTokenTtlSeconds: 2_592_000,
  });

  app.route("/auth", authRoutes);

  app.post("/seed-demo", async (c) => {
    await seedDemoAccount(deps.repos);
    return c.json({ ok: true });
  });

  return app;
}
