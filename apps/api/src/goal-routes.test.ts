import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { createRepositories } from "./repositories";
import * as schema from "./schema";
import { createGoalRoutes } from "./goal-routes";
import { seedDemoAccount, seedDemoHierarchy } from "./seed";
import { Hono } from "hono";

const __dirname = dirname(fileURLToPath(import.meta.url));

let app: Hono;
let userId: string;

beforeAll(async () => {
  const client = new PGlite();
  const migrationSql = readFileSync(join(__dirname, "../drizzle/0000_naive_nova.sql"), "utf8");
  const secondMigration = readFileSync(join(__dirname, "../drizzle/0001_nifty_guardsmen.sql"), "utf8");
  await client.exec(migrationSql);
  await client.exec(secondMigration);

  const db = drizzle(client, { schema });
  const repos = createRepositories(db);
  await seedDemoAccount(repos);

  const [demo] = await repos.getUserByEmail("demo@ascent.app");
  userId = demo!.id;

  app = new Hono();
  app.route("/goals", createGoalRoutes(repos));
});

describe("goal routes", () => {
  it("creates and lists a Goal", async () => {
    const res = await app.request("/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, title: "Launch ASCENT" }),
    });

    expect(res.status).toBe(201);
    const goal = (await res.json()) as { title: string };
    expect(goal.title).toBe("Launch ASCENT");
  });

  it("returns the seeded demo hierarchy", async () => {
    const res = await app.request("/goals/hierarchy");
    expect(res.status).toBe(200);

    const hierarchy = (await res.json()) as Array<{
      title: string;
      areas: Array<{ title: string; projects: Array<{ title: string; quests: unknown[] }> }>;
    }>;

    const demoGoal = hierarchy.find((g) => g.title === "Software Engineering Internship");
    expect(demoGoal).toBeDefined();
    expect(demoGoal?.areas.map((a) => a.title)).toEqual(["DSA", "Projects"]);
    expect(demoGoal?.areas[0]?.projects[0]?.quests.length).toBeGreaterThan(0);
  });
});
