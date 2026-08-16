import { Hono } from "hono";
import type { createRepositories } from "./repositories";

type Repos = ReturnType<typeof createRepositories>;

export function createGoalRoutes(repos: Repos) {
  const routes = new Hono();

  async function resolveUserId(requested: string | undefined): Promise<string | null> {
    if (requested && requested !== "demo") return requested;

    const [demo] = await repos.getUserByEmail("demo@ascent.app");
    return demo?.id ?? null;
  }

  routes.post("/", async (c) => {
    const body = await c.req.json();
    const userId = typeof body.userId === "string" ? body.userId : "";
    const title = typeof body.title === "string" ? body.title : "";

    if (!userId || !title) {
      return c.json({ error: "userId and title are required" }, 400);
    }

    const [goal] = await repos.createGoal({ userId, title });
    return c.json(goal, 201);
  });

  routes.get("/", async (c) => {
    const userId = await resolveUserId(c.req.query("userId"));
    if (!userId) return c.json([], 404);

    const goals = await repos.listGoals(userId);
    return c.json(goals);
  });

  routes.get("/hierarchy", async (c) => {
    const userId = await resolveUserId(c.req.query("userId"));
    if (!userId) return c.json([], 404);

    const goals = await repos.listGoals(userId);

    const result: Array<Record<string, unknown>> = [];
    for (const goal of goals) {
      const areas = await repos.listAreas(goal.id);
      const areasWithProjects = [];

      for (const area of areas) {
        const areaProjects = await repos.listProjects(area.id);
        const projectsWithQuests = [];

        for (const project of areaProjects) {
          const quests = await repos.listQuests(project.id);
          projectsWithQuests.push({ ...project, quests });
        }

        areasWithProjects.push({ ...area, projects: projectsWithQuests });
      }

      result.push({ ...goal, areas: areasWithProjects });
    }

    return c.json(result);
  });

  return routes;
}
