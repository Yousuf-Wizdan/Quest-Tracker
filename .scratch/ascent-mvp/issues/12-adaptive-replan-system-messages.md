# 12 — Adaptive replan + System Messages

**What to build:** The replan banner and System Messages that communicate schedule slippage and other state, so the day adapts without punishing the user.

**Blocked by:** 09 — Today screen + daily plan + Current Focus; 11 — Focus Mode + session sync + rewards; 02 — LLM client + fallback

**Status:** ready-for-agent

- [ ] Replan triggers after a Quest completes or a Focus Session ends when committed work exceeds the Daily Budget
- [ ] Replan outcomes show KEEP, SHORTEN, MOVE, and SKIP while protecting the primary objective
- [ ] Replan banner matches the design's adaptive replan UI
- [ ] System Messages render from the LLM with deterministic fallback
- [ ] System Messages communicate useful state (on track, behind, bottleneck) rather than decoration
