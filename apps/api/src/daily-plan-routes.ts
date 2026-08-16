import { Hono } from "hono";
import type { createRepositories } from "./repositories";
import { createLlmClient } from "./llm/client";
import type { LlmTransport } from "./llm/types";
import { generateDailyPlan, currentFocus } from "./planner";

type Repos = ReturnType<typeof createRepositories>;

export interface DailyPlanDeps {
  repos: Repos;
  llmTransport: LlmTransport | null;
}

export function createDailyPlanRoutes(deps: DailyPlanDeps) {
  const routes = new Hono();
  const llm = createLlmClient({ transport: deps.llmTransport ?? (async () => ({ text: "" })) });

  routes.get("/", async (c) => {
    const [demo] = await deps.repos.getUserByEmail("demo@ascent.app");
    if (!demo) {
      return c.json({ error: "Demo account not seeded" }, 404);
    }

    const goals = await deps.repos.listGoals(demo.id);
    const quests: Parameters<typeof generateDailyPlan>[0] = [];

    for (const goal of goals) {
      const areas = await deps.repos.listAreas(goal.id);
      for (const area of areas) {
        const projects = await deps.repos.listProjects(area.id);
        for (const project of projects) {
          const projectQuests = await deps.repos.listQuests(project.id);
          for (const quest of projectQuests) {
            quests.push({
              id: quest.id,
              title: quest.title,
              goalPriority: goal.priority,
              importance: quest.importance,
              planOrder: quests.length,
              dueDate: quest.dueDate ? quest.dueDate.toISOString().slice(0, 10) : null,
              estimateMinutes: quest.estimateMinutes,
              cognitiveLoad: quest.cognitiveLoad,
              completed: quest.completedAt !== null,
              tierOverride: quest.tier ?? undefined,
            });
          }
        }
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const plan = generateDailyPlan(quests, {
      dailyBudgetMinutes: demo.dailyBudgetMinutes,
      energyLevel: "NORMAL",
      today,
    });

    const focus = currentFocus(plan.scheduled);

    let why: { source: string; text: string } = { source: "template", text: "" };
    if (focus) {
      const [goal] = goals;
      const whyResult = await llm.explainWhy({
        questTitle: focus.quest.id,
        goalTitle: goal?.title ?? "your goal",
        areaTitle: "your plan",
      });
      why = { source: whyResult.source, text: whyResult.value.text };
    }

    return c.json({
      scheduled: plan.scheduled,
      moved: plan.moved,
      currentFocus: focus ? { quest: focus.quest, reason: focus.reason } : null,
      why,
    });
  });

  return routes;
}
