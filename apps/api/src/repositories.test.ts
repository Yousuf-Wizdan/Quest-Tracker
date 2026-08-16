import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { createRepositories } from "./repositories";
import * as schema from "./schema";

const __dirname = dirname(fileURLToPath(import.meta.url));

let db: ReturnType<typeof drizzle<typeof schema>>;

beforeAll(async () => {
  const client = new PGlite();
  const migrationSql = readFileSync(join(__dirname, "../drizzle/0000_naive_nova.sql"), "utf8");
  await client.exec(migrationSql);
  db = drizzle(client, { schema });
});

describe("repositories", () => {
  it("round-trips a user", async () => {
    const repos = createRepositories(db);

    await repos.createUser({
      id: "user-1",
      email: "demo@ascent.app",
      passwordHash: "hash",
      dailyBudgetMinutes: 300,
    });

    const users = await repos.getUserByEmail("demo@ascent.app");
    expect(users).toHaveLength(1);
    expect(users[0]?.dailyBudgetMinutes).toBe(300);
  });

  it("round-trips the Goal hierarchy through Quest and Step", async () => {
    const repos = createRepositories(db);

    const [user] = await repos.createUser({
      id: "user-2",
      email: "hierarchy@ascent.app",
      passwordHash: "hash",
      dailyBudgetMinutes: 300,
    });
    const [goal] = await repos.createGoal({ userId: user!.id, title: "Software Engineering Internship" });
    const [area] = await repos.createArea({ goalId: goal!.id, title: "DSA" });
    const [project] = await repos.createProject({ areaId: area!.id, title: "Graph Problems" });
    const [quest] = await repos.createQuest({
      projectId: project!.id,
      title: "Graph algorithms",
      estimateMinutes: 60,
      xpReward: 90,
      cognitiveLoad: "heavy",
      tier: "SHOULD",
    });
    await repos.createStep({ questId: quest!.id, title: "Warm-up", order: 0, xpReward: 20 });
    await repos.createStep({ questId: quest!.id, title: "Topological sort", order: 1, xpReward: 35 });

    const steps = await repos.listSteps(quest!.id);
    expect(steps.map((s) => s.title)).toEqual(["Warm-up", "Topological sort"]);

    await repos.completeStep(steps[0]!.id);
    await repos.completeQuest(quest!.id);

    const [completedQuest] = await repos.getQuestById(quest!.id);
    expect(completedQuest?.completedAt).toBeInstanceOf(Date);
  });

  it("round-trips a Focus Session and enforces single active session", async () => {
    const repos = createRepositories(db);

    const [user] = await repos.createUser({
      id: "user-3",
      email: "focus@ascent.app",
      passwordHash: "hash",
      dailyBudgetMinutes: 300,
    });
    const [goal] = await repos.createGoal({ userId: user!.id, title: "Goal" });
    const [area] = await repos.createArea({ goalId: goal!.id, title: "Area" });
    const [project] = await repos.createProject({ areaId: area!.id, title: "Project" });
    const [quest] = await repos.createQuest({
      projectId: project!.id,
      title: "Quest",
      estimateMinutes: 60,
      xpReward: 45,
    });

    const [session] = await repos.createFocusSession({
      id: "session-1",
      userId: user!.id,
      questId: quest!.id,
    });

    await expect(
      repos.createFocusSession({ id: "session-2", userId: user!.id, questId: quest!.id }),
    ).rejects.toThrow();

    await repos.endFocusSession(session!.id, 30, 15);
    const active = await repos.getActiveFocusSession(user!.id);
    expect(active[0]?.status).toBe("ended");
  });

  it("round-trips Inbox items and daily plan entries", async () => {
    const repos = createRepositories(db);

    const [user] = await repos.createUser({
      id: "user-4",
      email: "inbox@ascent.app",
      passwordHash: "hash",
      dailyBudgetMinutes: 300,
    });

    await repos.createInboxItem({ userId: user!.id, kind: "idea", content: "Ship faster" });
    const inbox = await repos.listInboxItems(user!.id);
    expect(inbox).toHaveLength(1);
    expect(inbox[0]?.content).toBe("Ship faster");

    const [goal] = await repos.createGoal({ userId: user!.id, title: "Goal" });
    const [area] = await repos.createArea({ goalId: goal!.id, title: "Area" });
    const [project] = await repos.createProject({ areaId: area!.id, title: "Project" });
    const [quest] = await repos.createQuest({
      projectId: project!.id,
      title: "Quest",
      estimateMinutes: 30,
      xpReward: 20,
    });

    await repos.createDailyPlanEntry({
      userId: user!.id,
      date: "2026-08-16",
      questId: quest!.id,
      tier: "MUST",
      planOrder: 0,
      impactScore: 20,
    });

    await repos.createAttributeHistory({
      userId: user!.id,
      attribute: "FOC",
      value: 76,
      reason: "Focused work",
    });
  });
});
