# 11 — Focus Mode + session sync + rewards

**What to build:** A distraction-free Focus Mode with an on-device count-up timer, session sync, single-session enforcement, and completion rewards.

**Blocked by:** 09 — Today screen + daily plan + Current Focus; 03 — Progression engine

**Status:** ready-for-agent

- [ ] Focus Mode shows only the current Quest, timer, progress, and controls
- [ ] Timer counts up on-device and survives a network drop
- [ ] Pause, complete, and end-session controls work
- [ ] Session syncs to the backend on pause, complete, and end
- [ ] Backend enforces at most one active Focus Session per user
- [ ] Quest Complete result shows XP and Attribute gains from the progression engine
- [ ] Partial sessions earn time-proportional XP
