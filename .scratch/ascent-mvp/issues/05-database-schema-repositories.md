# 05 — Database schema + repositories

**What to build:** The Drizzle schema and repository layer that persist all core entities, with round-trip tests proving the repositories behave through their public interfaces.

**Blocked by:** 01 — Monorepo scaffold + health tracer bullet

**Status:** ready-for-agent

- [ ] Schema covers users, refresh tokens, Goals, Areas, Projects, Quests, Steps, Focus Sessions, Inbox, daily-plan entries, and attribute history
- [ ] Migrations can be applied to a dev Neon database
- [ ] Repository interfaces are small and public; internals stay private
- [ ] Round-trip tests verify create, read, update, and delete through the repositories
- [ ] Quest/Step completion state and single active Focus Session invariant are represented
