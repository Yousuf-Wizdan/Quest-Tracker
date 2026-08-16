# ASCENT — MVP Spec

## Problem Statement

A person has large, long-term goals but cannot hold the whole plan in their head every day. They need a system that turns those goals into a realistic daily plan and tells them exactly what to do right now — without making them constantly plan, categorize, or second-guess their own productivity.

## Solution

ASCENT is a mobile-first personal operating system that feels like a living Status Window. The system owns the planning: it breaks a Goal into Areas, Projects, and Quests, generates each day's priority-ordered Quests, surfaces a single Current Focus, and adapts the rest of the day when work slips. The user does the work inside a distraction-free Focus Mode and earns meaningful progression (XP, Level, Attributes, Streak) from real behavior. An LLM assists on the edges — triaging captured items, proposing next Steps, and explaining *why* a Quest matters — but the planning spine stays deterministic and reliable.

## User Stories

1. As a new user, I want to sign up with an email and password, so that my data is private and tied to me.
2. As a returning user, I want to sign in and see my data, so that my Quests and progression persist across devices.
3. As a new user, I want to be guided through first-run onboarding, so that I understand the product and can set my Daily Budget.
4. As a new user, I want to optionally open the seeded demo account, so that I can explore the designed experience before entering my own life.
5. As a user, I want to see a futuristic Status Window, so that I immediately know where I am and how I'm doing.
6. As a user, I want to see my Level, XP, and progress toward the next Level, so that I know what I've earned.
7. As a user, I want to see my six Attributes (STR, INT, VIT, FOC, DIS, CON), so that I understand my measurable behavior in real-world terms.
8. As a user, I want my Attributes to change based on completed Quests and Focus Sessions, so that progression reflects actual work rather than arbitrary input.
9. As a user, I want the system to tell me my single Current Focus Quest, so that I never have to decide what to work on next.
10. As a user, I want to see why the Current Focus was chosen, so that the connection between today and my bigger goal stays visible.
11. As a user, I want to tap CONTINUE on the Current Focus, so that I can start working immediately.
12. As a user, I want to see Today's Quests grouped into MUST, SHOULD, and OPTIONAL tiers, so that I know what is essential versus nice-to-have.
13. As a user, I want the tiers to be visually distinct, so that I never mistake an optional activity for a critical one.
14. As a user, I want the planner to generate Today's Quests automatically at the start of each day, so that I don't have to plan.
15. As a user, I want to open a Quest and see its ordered Steps, so that I can make progress one piece at a time.
16. As a user, I want to check off individual Steps, so that my progress is tracked precisely.
17. As a user, I want to start a Focus Session on a Quest, so that I can work without distraction.
18. As a user, I want Focus Mode to show only the current Quest, an on-device timer, progress, and controls, so that everything else disappears.
19. As a user, I want the Focus timer to keep running during a network drop, so that my session is never lost.
20. As a user, I want to pause, complete, or end a Focus Session, so that I stay in control of my time.
21. As a user, I want the Focus Session to sync to the backend on pause, complete, or end, so that my progress is recorded.
22. As a user, I want to earn time-proportional XP when I end a session early, so that partial effort is still valued.
23. As a user, I want to earn the full Quest reward when I complete it, so that finishing matters.
24. As a user, I want to see a Quest Complete result with XP and Attribute gains, so that the reward is tangible.
25. As a user, I want the day's plan to adapt when I'm behind, so that one slipped task doesn't collapse the whole schedule.
26. As a user, I want replanning to KEEP my primary objective, SHORTEN lower-priority work, MOVE optional work to tomorrow, and SKIP the least important item, so that the primary objective stays protected.
27. As a user, I want a quick energy check in the morning, so that the planner can match Quests to how I feel.
28. As a user, I want the energy check to take about two seconds and be skippable, so that it never feels like a wellness tracker.
29. As a user, I want Quests tagged with cognitive load (light/standard/heavy), so that low-energy days favor light work and high-energy days favor heavy work.
30. As a user, I want to capture a Task, Idea, or Note through a large + button in seconds, so that I never lose a thought.
31. As a user, I want captured Task/Idea/Note items to land in an Inbox, so that I don't have to categorize them immediately.
32. As a user, I want to capture a new Goal, so that I can give the system a destination.
33. As a user, I want the LLM to triage an Inbox item into a Goal/Area/Project/Quest, so that vague input becomes actionable work.
34. As a user, I want the LLM to propose next Steps for a Quest, so that I don't have to break it down myself.
35. As a user, I want a "Why this?" explanation on the Current Focus and Quest detail, so that today's work stays connected to the goal.
36. As a user, I want System Messages that communicate state and bottlenecks, so that the app feels alive and informative.
37. As a user, I want deterministic fallbacks when the LLM is unavailable, so that the app still works.
38. As a user, I want to see my Goals, their Areas, and their Projects, so that I know where I'm going.
39. As a user, I want to see a Goal's progress, so that I know how far I've come.
40. As a user, I want to see my Progress screen with Character, Performance, Attributes, and Milestones, so that I can review my improvement.
41. As a user, I want to see my current Streak, so that consistency feels rewarded.
42. As a user, I want XP overflow to carry into the next Level, so that no earned progress is discarded.
43. As a user, I want to know the demo account credentials on the login screen, so that I can explore before committing.
44. As a developer, I want all server logic behind a small number of testable pure TypeScript seams, so that the adaptive and progression rules are verifiable.

## Implementation Decisions

### Product

- Product display name is **ASCENT**; repo remains Quest-Tracker.
- Accent color is the design's **red** system, taken from `design/ascend-status-window.html` as the visual source of truth.
- Bottom navigation is **4 tabs + center Capture**: Status, Today, +Capture, Progress, Goals.
- Focus Mode is entered from the Current Focus card or a Quest, not a separate tab.
- The Cover frame becomes first-run **onboarding/splash**.
- The three designed frames are implemented faithfully; **Focus Mode, Progress, and Goals extend the same design system** (tokens, type scale, spacing, motion).
- The app ships a **seeded demo account** so first launch matches the design; fresh users can also create their own account and start empty.

### Data model

- Persistent hierarchy is **Goal → Area → Project → Quest → Step**.
- Vision, Milestones, and Weekly Objectives are **derived views**, not stored entities.
- A **Quest** has an estimated duration, XP reward, an impact importance value, a cognitive-load tag (light/standard/heavy), an optional due date, ordered **Steps**, and completion state.
- A **Step** has its own XP reward and completion state; a Quest is complete when all Steps are complete.
- Six **Attributes**: STR, INT, VIT, FOC, DIS, CON. Each has a value and grows from completed work.
- **Inbox** items hold Quick Capture content (Task/Idea/Note) until triaged.
- **Daily Budget** is the user's daily focus capacity in minutes; required entry on a fresh account, seeded to 5 hours for the demo account.

### Architecture

- **Monorepo** using pnpm workspaces + Turborepo: `apps/mobile` (Expo + Expo Router), `apps/api` (Hono), `packages/types` (shared types).
- **Data** lives in **Neon Postgres**, accessed only by the backend via **Drizzle ORM**.
- **API** is a thin Hono server deployed to **Vercel** (Node functions, Neon pooled driver).
- **Auth** is email/password with **JWT access + refresh tokens**; email verification is skipped for the MVP.
- **Demo account** is `demo@ascent.app` / `demo1234`, credentials shown on the login screen.
- **Rate limiting** is basic per-IP on auth and LLM routes.
- **Secrets** (Neon URL, LLM key) live only in backend env. The Expo app env holds only the public API base URL.

### Planner and LLM

- The **planner is deterministic TypeScript, running server-side**.
- Planner responsibilities: generate Today's Quests, rank the Current Focus, and perform adaptive replan.
- **Current Focus ranking**: unfinished Quests ranked by Tier first (MUST > SHOULD > OPTIONAL), then Impact Score, then plan order; top unfinished wins.
- **Impact Score** = (goal priority × 2) + quest importance + urgency bonus (overdue +5, due today +3, due this week +1).
- **Tier assignment** is auto-assigned by the planner and user-overridable.
- **Adaptive replan** triggers after each Quest completes or Focus Session ends when committed work exceeds the Daily Budget; outcomes are KEEP, SHORTEN, MOVE, or SKIP, protecting the primary objective.
- **Energy Level** is a LOW/NORMAL/HIGH morning sheet (default NORMAL); it steers selection via Quest cognitive-load tags.
- The **LLM** is an OpenAI-compatible endpoint (backend env var `LLM_BASE_URL`, e.g. an OpenAI-compatible proxy base URL) with model `deepseek/deepseek-v4-flash`, used for exactly **four jobs**: triage Inbox items, propose next Steps, generate "Why this?" explanations, and write System Messages.
- LLM timing is **hybrid**: triage and Step suggestions on demand; "Why this?" and System Messages generated at plan time and cached.
- LLM failure falls back to **deterministic templates**; untriaged Inbox items remain in the Inbox.

### Gamification

- **XP rules** use the design's numbers (e.g. 90-minute deep work = +45 XP).
- **Level curve** is flat 10,000 XP per Level; overflow carries over.
- **Streak** counts consecutive days with at least one MUST-tier Quest completed.
- **Partial focus** earns time-proportional XP rounded to nearest 5, minimum 10 minutes; full Quest reward on completion.
- Milestones and level-up requirement checklists are **out of scope**.

### Focus Mode

- Timer counts **up** from zero; the Quest's estimate is a target.
- Timer runs **on-device** and syncs on pause, complete, or end.
- A user has **at most one active Focus Session**; the backend enforces this by ending the prior session when a new one starts.

## Testing Decisions

Tests verify behavior through public interfaces, never implementation details, and never assert on internals like call counts or private methods. Expected values come from independent known-good literals, not re-derivations. Work proceeds in vertical red-green slices, one test and one minimal implementation at a time.

Three seams are tested:

1. **Server planner** — one public interface over daily plan generation, Current Focus ranking, and adaptive replan.
2. **Server progression** — one public interface over XP, Attributes, Level, and Streak rules.
3. **Client focus session** — one public interface over the on-device timer state machine and its sync-on-transition behavior.

The planner and progression engines are pure TypeScript and are the highest-value, highest-complexity logic, so they receive the deepest test coverage. The focus-session state machine is tested for transition correctness. Prior art is none (greenfield repo), so these seams establish the pattern for future tests.

## Out of Scope

- Calendar integration and availability-aware focus windows
- Smart notifications and reminders
- Home-screen widgets, lock-screen widgets, and Live Activities
- Distraction Shield / device Do Not Disturb control
- Daily Review, Weekly Review, and Recovery Mode
- Milestones and level-up requirement checklists
- Email verification and password reset flows
- Offline read/write caching and sync engine
- Production deployment of mobile or API (dev-first)
- Real-time collaboration or multi-device live sync

## Further Notes

The design archive (`design/ascend-status-window.html`, `design/DESIGN-MANIFEST.json`, `design/DESIGN-HANDOFF.md`) is the visual contract. The three designed frames (Cover, Today, Quest Detail) must match the export; missing surfaces extend its tokens and patterns rather than introduce new ones.

The glossary in `CONTEXT.md` is the canonical vocabulary for all user-facing and technical names. ADRs `0001` and `0002` document the cloud-first architecture and the deterministic-planner/bounded-LLM boundary and must be respected.
