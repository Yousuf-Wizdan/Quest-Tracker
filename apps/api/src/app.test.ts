import { describe, expect, it } from "vitest";
import type { HealthResponse } from "@ascent/types";
import { createApp } from "./app";
import type { createRepositories } from "./repositories";

function emptyRepos(): ReturnType<typeof createRepositories> {
  return {
    createUser: async () => [],
    getUserByEmail: async () => [],
    getUserById: async () => [],
    createRefreshToken: async () => [],
    getRefreshTokenByHash: async () => [],
    revokeRefreshToken: async () => [],
    createProfile: async () => [],
    getProfile: async () => [],
    createGoal: async () => [],
    listGoals: async () => [],
    createArea: async () => [],
    createProject: async () => [],
    createQuest: async () => [],
    getQuestById: async () => [],
    completeQuest: async () => [],
    createStep: async () => [],
    listSteps: async () => [],
    completeStep: async () => [],
    createFocusSession: async () => [],
    endFocusSession: async () => [],
    getActiveFocusSession: async () => [],
    createInboxItem: async () => [],
    listInboxItems: async () => [],
    createDailyPlanEntry: async () => [],
    createAttributeHistory: async () => [],
  } as unknown as ReturnType<typeof createRepositories>;
}

describe("health endpoint", () => {
  it("reports online when the database is reachable", async () => {
    const app = createApp({
      checkDatabase: async () => true,
      repos: emptyRepos(),
      jwtSecret: "test-secret-that-is-long-enough-for-hs256-signing",
    });

    const res = await app.request("/health");

    expect(res.status).toBe(200);
    const body = (await res.json()) as HealthResponse;
    expect(body.status).toBe("online");
    expect(body.database).toBe("connected");
    expect(typeof body.timestamp).toBe("string");
  });

  it("reports offline when the database is unreachable", async () => {
    const app = createApp({
      checkDatabase: async () => false,
      repos: emptyRepos(),
      jwtSecret: "test-secret-that-is-long-enough-for-hs256-signing",
    });

    const res = await app.request("/health");

    expect(res.status).toBe(200);
    const body = (await res.json()) as HealthResponse;
    expect(body.status).toBe("offline");
    expect(body.database).toBe("unavailable");
  });
});
