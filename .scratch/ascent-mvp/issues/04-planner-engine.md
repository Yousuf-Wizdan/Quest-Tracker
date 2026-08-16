# 04 — Planner engine (pure TypeScript)

**What to build:** A pure, deterministic engine that owns the planning spine: generating Today's Quests, ranking the Current Focus, assigning tiers, matching energy to cognitive load, and replanning the day when it no longer fits.

**Blocked by:** 03 — Progression engine (pure TypeScript)

**Status:** complete

- [x] Impact Score = (goal priority × 2) + quest importance + urgency bonus (overdue +5, due today +3, due this week +1)
- [x] Tier assignment auto-assigns MUST/SHOULD/OPTIONAL and remains user-overridable
- [x] Current Focus ranking orders by tier, then Impact Score, then plan order, and returns the top unfinished Quest
- [x] Daily plan generation fits Quests within the user's Daily Budget
- [x] Energy Level (LOW/NORMAL/HIGH) steers selection via Quest cognitive-load tags
- [x] Adaptive replan produces KEEP, SHORTEN, MOVE, and SKIP outcomes while protecting the primary objective
- [x] Tests cover the public planner interface with independent expected values
