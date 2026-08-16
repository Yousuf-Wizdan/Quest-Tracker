# 11 — Focus Mode + session sync + rewards

**What to build:** A distraction-free Focus Mode with an on-device count-up timer, session sync, single-session enforcement, and completion rewards.

**Blocked by:** 09 — Today screen + daily plan + Current Focus; 03 — Progression engine

**Status:** complete

- [x] Focus Mode shows only the current Quest, timer, progress, and controls
- [x] Timer counts up on-device and survives a network drop
- [x] Pause, complete, and end-session controls work
- [x] Session syncs to the backend on pause, complete, and end
- [x] Backend enforces at most one active Focus Session per user
- [x] Quest Complete result shows XP and Attribute gains from the progression engine
- [x] Partial sessions earn time-proportional XP
