# 03 — Progression engine (pure TypeScript)

**What to build:** A pure, testable engine that turns completed work into progression. It owns XP, Levels, Attributes, Streaks, and partial-focus rewards.

**Blocked by:** 01 — Monorepo scaffold + health tracer bullet

**Status:** ready-for-agent

- [ ] XP rewards use the design's numbers (e.g. 90-minute deep work = +45 XP)
- [ ] Level uses a flat 10,000 XP requirement with overflow carried into the next Level
- [ ] Six Attributes (STR, INT, VIT, FOC, DIS, CON) grow from completed Quests and Focus Sessions
- [ ] Streak counts consecutive days with at least one MUST-tier Quest completed
- [ ] Partial Focus Sessions earn time-proportional XP rounded to nearest 5, with a 10-minute minimum
- [ ] Full Quest reward applies on completion
- [ ] Tests cover the public progression interface with independent expected values
