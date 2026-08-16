import { Hono } from "hono";
import type { createRepositories } from "./repositories";
import { createLlmClient } from "./llm/client";
import type { LlmTransport } from "./llm/types";

type Repos = ReturnType<typeof createRepositories>;

export interface QuestDetailDeps {
  repos: Repos;
  llmTransport: LlmTransport | null;
}

export function createQuestRoutes(deps: QuestDetailDeps) {
  const routes = new Hono();
  const llm = createLlmClient({ transport: deps.llmTransport ?? (async () => ({ text: "" })) });

  routes.get("/:id", async (c) => {
    const id = c.req.param("id");
    const [quest] = await deps.repos.getQuestById(id);
    if (!quest) {
      return c.json({ error: "Quest not found" }, 404);
    }

    const steps = await deps.repos.listSteps(id);
    return c.json({ quest, steps });
  });

  routes.post("/:id/steps", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const title = typeof body.title === "string" ? body.title : "";
    const order = typeof body.order === "number" ? body.order : 0;
    const xpReward = typeof body.xpReward === "number" ? body.xpReward : 0;

    if (!title) {
      return c.json({ error: "Step title is required" }, 400);
    }

    const [step] = await deps.repos.createStep({ questId: id, title, order, xpReward });
    return c.json(step, 201);
  });

  routes.post("/:id/complete-step", async (c) => {
    const body = await c.req.json();
    const stepId = typeof body.stepId === "string" ? body.stepId : "";
    if (!stepId) {
      return c.json({ error: "stepId is required" }, 400);
    }

    await deps.repos.completeStep(stepId);
    return c.json({ ok: true });
  });

  routes.post("/:id/suggest-steps", async (c) => {
    const id = c.req.param("id");
    const [quest] = await deps.repos.getQuestById(id);
    if (!quest) {
      return c.json({ error: "Quest not found" }, 404);
    }

    const result = await llm.proposeSteps({ questTitle: quest.title });

    return c.json({ suggestions: [{ text: result.value.text, source: result.source }] });
  });

  return routes;
}
