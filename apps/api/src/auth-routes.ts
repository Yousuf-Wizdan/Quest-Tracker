import type { Context } from "hono";
import { Hono } from "hono";
import { hashPassword, hashToken, issueTokens, verifyPassword } from "./auth";
import type { createRepositories } from "./repositories";

type Repos = ReturnType<typeof createRepositories>;

export interface AuthRoutesConfig {
  jwtSecret: string;
  accessTokenTtlSeconds: number;
  refreshTokenTtlSeconds: number;
}

const RATE_LIMIT = 20;

export function createAuthRoutes(repos: Repos, config: AuthRoutesConfig) {
  const routes = new Hono();

  const rateLimiter = new Map<string, number[]>();

  function rateLimited(c: Context, key: string): boolean {
    const now = Date.now();
    const window = 60_000;
    const hits = (rateLimiter.get(key) ?? []).filter((t) => now - t < window);
    if (hits.length >= RATE_LIMIT) return true;

    hits.push(now);
    rateLimiter.set(key, hits);
    return false;
  }

  routes.post("/signup", async (c) => {
    const ip = c.req.header("x-forwarded-for") ?? "local";
    if (rateLimited(c, `signup:${ip}`)) {
      return c.json({ error: "Too many requests" }, 429);
    }

    const body = await c.req.json();
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const existing = await repos.getUserByEmail(email);
    if (existing.length > 0) {
      return c.json({ error: "Email already registered" }, 409);
    }

    const passwordHash = await hashPassword(password);
    const [user] = await repos.createUser({
      id: crypto.randomUUID(),
      email,
      passwordHash,
      dailyBudgetMinutes: 300,
    });

    const tokens = await issueTokens(config, { sub: user!.id, email: user!.email });
    await repos.createRefreshToken({
      id: crypto.randomUUID(),
      userId: user!.id,
      tokenHash: hashToken(tokens.refreshToken),
      expiresAt: new Date(Date.now() + config.refreshTokenTtlSeconds * 1000),
    });

    return c.json({ user: { id: user!.id, email: user!.email }, ...tokens }, 201);
  });

  routes.post("/login", async (c) => {
    const ip = c.req.header("x-forwarded-for") ?? "local";
    if (rateLimited(c, `login:${ip}`)) {
      return c.json({ error: "Too many requests" }, 429);
    }

    const body = await c.req.json();
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    const [user] = await repos.getUserByEmail(email);
    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const tokens = await issueTokens(config, { sub: user.id, email: user.email });
    await repos.createRefreshToken({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: hashToken(tokens.refreshToken),
      expiresAt: new Date(Date.now() + config.refreshTokenTtlSeconds * 1000),
    });

    return c.json({ user: { id: user.id, email: user.email }, ...tokens });
  });

  routes.post("/refresh", async (c) => {
    const body = await c.req.json();
    const refreshToken = typeof body.refreshToken === "string" ? body.refreshToken : "";

    if (!refreshToken) {
      return c.json({ error: "Refresh token is required" }, 400);
    }

    const [stored] = await repos.getRefreshTokenByHash(hashToken(refreshToken));
    if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
      return c.json({ error: "Invalid refresh token" }, 401);
    }

    await repos.revokeRefreshToken(stored.id);

    const [user] = await repos.getUserById(stored.userId);
    if (!user) {
      return c.json({ error: "Invalid refresh token" }, 401);
    }

    const tokens = await issueTokens(config, { sub: user.id, email: user.email });
    await repos.createRefreshToken({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: hashToken(tokens.refreshToken),
      expiresAt: new Date(Date.now() + config.refreshTokenTtlSeconds * 1000),
    });

    return c.json(tokens);
  });

  return routes;
}

