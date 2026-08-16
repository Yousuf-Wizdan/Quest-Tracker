# ASCENT

A mobile-first personal productivity system that turns large goals into a daily plan and a single Current Focus quest. The system does the planning; the user does the work.

## Repo layout

- `apps/mobile` — Expo (Expo Router) app
- `apps/api` — Hono API on Vercel, talking to Neon Postgres via Drizzle
- `packages/types` — shared TypeScript types

## Prerequisites

- Node 20+
- pnpm

## Setup

```sh
pnpm install
```

### API env

Copy `.env.example` to `apps/api/.env` and fill in `DATABASE_URL` (Neon Postgres). The API will report the database as unavailable when it is missing.

### Mobile env

Copy `.env.example` to `apps/mobile/.env` and set `EXPO_PUBLIC_API_URL`. Defaults to `http://localhost:3000`.

## Dev commands

```sh
pnpm dev          # runs both dev tasks
pnpm dev:api      # API only
pnpm dev:mobile   # Expo only
```

## Checks

```sh
pnpm test        # run Vitest
pnpm typecheck   # typecheck all packages
pnpm build       # build all packages
```
