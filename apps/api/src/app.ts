import { Hono } from "hono";
import type { HealthResponse } from "@ascent/types";
import type { createRepositories } from "./repositories";
import { createAuthRoutes } from "./auth-routes";
import { createGoalRoutes } from "./goal-routes";
import { createDailyPlanRoutes } from "./daily-plan-routes";
import { seedDemoAccount } from "./seed";

export interface AppDeps {
  checkDatabase: () => Promise<boolean>;
  repos: ReturnType<typeof createRepositories>;
  jwtSecret: string;
  llmTransport?: import("./llm/types").LlmTransport | null;
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
  app.route("/goals", createGoalRoutes(deps.repos));
  app.route("/daily-plan", createDailyPlanRoutes({ repos: deps.repos, llmTransport: deps.llmTransport ?? null }));

  app.post("/seed-demo", async (c) => {
    await seedDemoAccount(deps.repos);
    return c.json({ ok: true });
  });

  app.get("/profile/demo", async (c) => {
    const [demo] = await deps.repos.getUserByEmail("demo@ascent.app");
    if (!demo) {
      await seedDemoAccount(deps.repos);
    }

    const [user] = await deps.repos.getUserByEmail("demo@ascent.app");
    const [profile] = await deps.repos.getProfile(user!.id);

    return c.json({
      totalXp: profile?.totalXp ?? 0,
      streak: profile?.streak ?? 0,
      attributes: JSON.parse(profile?.attributes ?? "{}"),
    });
  });

  return app;
}
