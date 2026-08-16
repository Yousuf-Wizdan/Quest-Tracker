import { Hono } from "hono";
import type { createRepositories } from "./repositories";
import { createLlmClient } from "./llm/client";
import type { LlmTransport } from "./llm/types";

type Repos = ReturnType<typeof createRepositories>;

export function createInboxRoutes(repos: Repos, llmTransport: LlmTransport | null) {
  const routes = new Hono();
  const llm = createLlmClient({ transport: llmTransport ?? (async () => ({ text: "" })) });

  routes.get("/", async (c) => {
    const [demo] = await repos.getUserByEmail("demo@ascent.app");
    if (!demo) return c.json([], 404);

    const items = await repos.listInboxItems(demo.id);
    return c.json(items);
  });

  routes.post("/", async (c) => {
    const body = await c.req.json();
    const [demo] = await repos.getUserByEmail("demo@ascent.app");
    if (!demo) return c.json({ error: "Demo account not seeded" }, 404);

    const kind = body.kind === "idea" || body.kind === "note" ? body.kind : "task";
    const content = typeof body.content === "string" ? body.content : "";

    if (!content) {
      return c.json({ error: "content is required" }, 400);
    }

    const [item] = await repos.createInboxItem({ userId: demo.id, kind, content });
    return c.json(item, 201);
  });

  routes.post("/:id/triage", async (c) => {
    const id = c.req.param("id");
    const [demo] = await repos.getUserByEmail("demo@ascent.app");
    if (!demo) return c.json({ error: "Demo account not seeded" }, 404);

    const items = await repos.listInboxItems(demo.id);
    const item = items.find((i) => i.id === id);
    if (!item) {
      return c.json({ error: "Inbox item not found" }, 404);
    }

    const result = await llm.proposeSteps({ questTitle: item.content });

    return c.json({
      suggestion: { text: result.value.text, source: result.source },
      filed: result.source === "llm",
    });
  });

  return routes;
}
