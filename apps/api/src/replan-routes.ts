import { Hono } from "hono";
import type { createRepositories } from "./repositories";
import { createLlmClient } from "./llm/client";
import type { LlmTransport } from "./llm/types";
import { replan, type DailyQuest } from "./planner";

type Repos = ReturnType<typeof createRepositories>;

export function createReplanRoutes(repos: Repos, llmTransport: LlmTransport | null) {
  const routes = new Hono();
  const llm = createLlmClient({ transport: llmTransport ?? (async () => ({ text: "" })) });

  routes.post("/", async (c) => {
    const body = await c.req.json();
    const scheduled = (body.scheduled ?? []) as DailyQuest[];
    const remainingBudgetMinutes = typeof body.remainingBudgetMinutes === "number"
      ? body.remainingBudgetMinutes
      : 0;

    const decisions = replan(scheduled, remainingBudgetMinutes);

    const message = await llm.systemMessage({
      kind: "behind",
      questTitle: scheduled[0]?.title ?? "your primary Quest",
    });

    return c.json({
      decisions,
      systemMessage: { text: message.value.text, source: message.source },
    });
  });

  return routes;
}
