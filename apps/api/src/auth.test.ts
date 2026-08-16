import { describe, expect, it } from "vitest";
import {
  hashPassword,
  hashToken,
  issueTokens,
  verifyAccessToken,
  verifyPassword,
  type AuthConfig,
} from "./auth";

const config: AuthConfig = {
  jwtSecret: "test-secret-that-is-long-enough-for-hs256-signing",
  accessTokenTtlSeconds: 60,
  refreshTokenTtlSeconds: 3600,
};

describe("auth", () => {
  it("hashes and verifies a password", async () => {
    const hashed = await hashPassword("demo1234");
    expect(hashed).not.toContain("demo1234");

    await expect(verifyPassword("demo1234", hashed)).resolves.toBe(true);
    await expect(verifyPassword("wrong", hashed)).resolves.toBe(false);
  });

  it("hashes refresh tokens before storage", () => {
    const hash = hashToken("opaque-token");
    expect(hash).toHaveLength(64);
    expect(hash).not.toBe("opaque-token");
  });

  it("issues and verifies an access token", async () => {
    const pair = await issueTokens(config, { sub: "user-1", email: "demo@ascent.app" });

    const claims = await verifyAccessToken(config, pair.accessToken);
    expect(claims).toEqual({ sub: "user-1", email: "demo@ascent.app" });
  });

  it("rejects a token signed with a different secret", async () => {
    const pair = await issueTokens(config, { sub: "user-1", email: "demo@ascent.app" });

    const claims = await verifyAccessToken(
      { ...config, jwtSecret: "a-different-secret-that-is-also-long-enough" },
      pair.accessToken,
    );

    expect(claims).toBeNull();
  });
});
