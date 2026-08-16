import { describe, expect, it } from "vitest";
import type { HealthResponse } from "@ascent/types";
import { createApp } from "./app";

describe("health endpoint", () => {
  it("reports online when the database is reachable", async () => {
    const app = createApp({ checkDatabase: async () => true });

    const res = await app.request("/health");

    expect(res.status).toBe(200);
    const body = (await res.json()) as HealthResponse;
    expect(body.status).toBe("online");
    expect(body.database).toBe("connected");
    expect(typeof body.timestamp).toBe("string");
  });

  it("reports offline when the database is unreachable", async () => {
    const app = createApp({ checkDatabase: async () => false });

    const res = await app.request("/health");

    expect(res.status).toBe(200);
    const body = (await res.json()) as HealthResponse;
    expect(body.status).toBe("offline");
    expect(body.database).toBe("unavailable");
  });
});
