import { Hono } from "hono";
import type { createRepositories } from "./repositories";
import { applyFocusSession, applyQuestCompletion, createInitialState } from "./progression";

type Repos = ReturnType<typeof createRepositories>;

export function createFocusRoutes(repos: Repos) {
  const routes = new Hono();

  routes.post("/start", async (c) => {
    const body = await c.req.json();
    const userId = typeof body.userId === "string" ? body.userId : "";
    const questId = typeof body.questId === "string" ? body.questId : "";

    if (!userId || !questId) {
      return c.json({ error: "userId and questId are required" }, 400);
    }

    const active = await repos.getActiveFocusSession(userId);
    for (const session of active) {
      if (session.status === "active") {
        await repos.endFocusSession(session.id, session.focusedMinutes, session.xpEarned);
      }
    }

    const [session] = await repos.createFocusSession({
      id: crypto.randomUUID(),
      userId,
      questId,
    });

    return c.json(session, 201);
  });

  routes.post("/end", async (c) => {
    const body = await c.req.json();
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    const focusedMinutes = typeof body.focusedMinutes === "number" ? body.focusedMinutes : 0;
    const xpEarned = typeof body.xpEarned === "number" ? body.xpEarned : 0;

    if (!sessionId) {
      return c.json({ error: "sessionId is required" }, 400);
    }

    const [session] = await repos.endFocusSession(sessionId, focusedMinutes, xpEarned);
    return c.json(session);
  });

  routes.post("/complete", async (c) => {
    const body = await c.req.json();
    const questId = typeof body.questId === "string" ? body.questId : "";

    if (!questId) {
      return c.json({ error: "questId is required" }, 400);
    }

    const [quest] = await repos.getQuestById(questId);
    if (!quest) {
      return c.json({ error: "Quest not found" }, 404);
    }

    const state = applyQuestCompletion(createInitialState(), {
      xpReward: quest.xpReward,
      attributeGains: {},
      tier: "MUST",
      completedDate: new Date().toISOString().slice(0, 10),
    });

    await repos.completeQuest(questId);
    return c.json({ xp: state.totalXp, attributes: state.attributes });
  });

  return routes;
}
