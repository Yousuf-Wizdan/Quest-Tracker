# 01 — Monorepo scaffold + health tracer bullet

**What to build:** A working pnpm+Turborepo monorepo with a mobile app and a backend API. The mobile app boots and reaches the API's health endpoint, which verifies a live connection to Neon Postgres.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] pnpm workspaces + Turborepo set up with `apps/mobile`, `apps/api`, and a shared types package
- [ ] Expo app (Expo Router) created and boots to a minimal screen
- [ ] Hono API created with a `/health` endpoint that runs `SELECT 1` against Neon Postgres
- [ ] Mobile app calls `/health` and renders a SYSTEM online/offline state
- [ ] Vitest harness wired in the repo and a trivial test passes
- [ ] README documents the dev commands for running mobile and API together
