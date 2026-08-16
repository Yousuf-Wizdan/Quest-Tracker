import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { createRepositories } from "./repositories";
import * as schema from "./schema";
import { createAuthRoutes } from "./auth-routes";
import { Hono } from "hono";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface AuthBody {
  user?: { id: string; email: string };
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

let app: Hono;

beforeAll(async () => {
  const client = new PGlite();
  const migrationSql = readFileSync(join(__dirname, "../drizzle/0000_naive_nova.sql"), "utf8");
  const secondMigration = readFileSync(join(__dirname, "../drizzle/0001_nifty_guardsmen.sql"), "utf8");
  await client.exec(migrationSql);
  await client.exec(secondMigration);
  const db = drizzle(client, { schema });
  const repos = createRepositories(db);

  const routes = createAuthRoutes(repos, {
    jwtSecret: "test-secret-that-is-long-enough-for-hs256-signing",
    accessTokenTtlSeconds: 60,
    refreshTokenTtlSeconds: 3600,
  });

  app = new Hono();
  app.route("/auth", routes);
});

describe("auth routes", () => {
  it("signs up a new user and returns tokens", async () => {
    const res = await app.request("/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "new@ascent.app", password: "password" }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as AuthBody;
    expect(body.user?.email).toBe("new@ascent.app");
    expect(typeof body.accessToken).toBe("string");
    expect(typeof body.refreshToken).toBe("string");
  });

  it("rejects duplicate signup", async () => {
    await app.request("/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "dup@ascent.app", password: "password" }),
    });

    const res = await app.request("/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "dup@ascent.app", password: "password" }),
    });

    expect(res.status).toBe(409);
  });

  it("logs in with valid credentials", async () => {
    await app.request("/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "login@ascent.app", password: "password" }),
    });

    const res = await app.request("/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "login@ascent.app", password: "password" }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as AuthBody;
    expect(typeof body.accessToken).toBe("string");
  });

  it("rejects invalid credentials", async () => {
    const res = await app.request("/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "login@ascent.app", password: "wrong" }),
    });

    expect(res.status).toBe(401);
  });

  it("refreshes tokens without a password", async () => {
    const signup = await app.request("/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "refresh@ascent.app", password: "password" }),
    });
    const signupBody = (await signup.json()) as AuthBody;

    const res = await app.request("/auth/refresh", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: signupBody.refreshToken }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as AuthBody;
    expect(typeof body.accessToken).toBe("string");
    expect(typeof body.refreshToken).toBe("string");
  });
});
