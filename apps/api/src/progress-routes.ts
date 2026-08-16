import { Hono } from "hono";
import type { createRepositories } from "./repositories";
import type { AttributeMap } from "@ascent/types";

type Repos = ReturnType<typeof createRepositories>;

export function createProgressRoutes(repos: Repos) {
  const routes = new Hono();

  routes.get("/", async (c) => {
    const [demo] = await repos.getUserByEmail("demo@ascent.app");
    if (!demo) return c.json({ error: "Demo account not seeded" }, 404);

    const [profile] = await repos.getProfile(demo.id);
    const attributes = JSON.parse(profile?.attributes ?? "{}") as AttributeMap;

    const goals = await repos.listGoals(demo.id);
    let questCount = 0;
    let questsDone = 0;

    for (const goal of goals) {
      const areas = await repos.listAreas(goal.id);
      for (const area of areas) {
        const projects = await repos.listProjects(area.id);
        for (const project of projects) {
          const quests = await repos.listQuests(project.id);
          questCount += quests.length;
          questsDone += quests.filter((q) => q.completedAt !== null).length;
        }
      }
    }

    return c.json({
      level: Math.floor((profile?.totalXp ?? 0) / 10_000) + 1,
      totalXp: profile?.totalXp ?? 0,
      streak: profile?.streak ?? 0,
      attributes,
      focusedHours: 0,
      tasksCompleted: questsDone,
      completionRate: questCount === 0 ? 0 : questsDone / questCount,
    });
  });

  return routes;
}
