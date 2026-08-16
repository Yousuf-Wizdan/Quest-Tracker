# ASCENT

A mobile-first personal productivity system that turns large goals into a daily plan and a single Current Focus quest. The system does the planning; the user does the work.

## Language

**Quest**:
A single unit of work to be done, with an estimated duration, an XP reward, and optional ordered Steps.
_Avoid_: Task, todo, item

**Step**:
An ordered sub-unit inside a Quest. Each Step has its own XP and completion state. A Quest is complete when all its Steps are complete.
_Avoid_: Subtask, checklist item

**Focus Session**:
A timed period of work on a Quest, started from Focus Mode. Its duration feeds XP, attribute growth, and time-tracking.
_Avoid_: Pomodoro, timer run, work block

**Focus Mode**:
The full-screen, distraction-free interface shown during a Focus Session.
_Avoid_: Timer screen, session screen

**Current Focus**:
The single unfinished Quest the system ranks highest right now — what the user should work on next.
_Avoid_: Active task, primary task, top priority

**Tier**:
One of three priority levels a Quest carries on a given day: MUST, SHOULD, or OPTIONAL. Auto-assigned by the planner, user-overridable.
_Avoid_: Priority, importance class, bucket

**Energy Level**:
A quick daily self-report — LOW, NORMAL, or HIGH — captured once at the start of the day and used to steer Quest selection.
_Avoid_: Mood, wellness score, energy score

**Cognitive Load**:
A Quest's intensity tag — light, standard, or heavy — used to match Quests to the day's Energy Level.
_Avoid_: Difficulty, effort level

**Attribute**:
One of six measurable behavior-derived stats: STR (Strength), INT (Intelligence), VIT (Vitality), FOC (Focus), DIS (Discipline), CON (Consistency). Attributes grow from completed work, not arbitrary input.
_Avoid_: Stat, skill, trait

**XP**:
Experience points earned from completed Quests and Focus Sessions. 10,000 XP gains one Level, with overflow carried into the next.
_Avoid_: Points, score

**Level**:
A whole-number progression rank derived from cumulative XP.
_Avoid_: Rank, tier (reserved for quest priority)

**Streak**:
The count of consecutive days on which at least one MUST-tier Quest was completed.
_Avoid_: Chain, run

**Daily Budget**:
The user's daily focus capacity, in minutes, set once at onboarding and changeable later. The planner fits Quests within it.
_Avoid_: Quota, capacity limit, daily limit

**Impact Score**:
A deterministic value used to rank and tier Quests, computed from goal priority, quest importance, and urgency.
_Avoid_: Priority score, weight

**Replan**:
The planner's adjustment to the remaining day — KEEP, SHORTEN, MOVE, or SKIP — triggered when committed work no longer fits the Daily Budget.
_Avoid_: Reschedule, rebalance, reshuffle

**Inbox**:
Where Quick Capture items (Task, Idea, Note) land before the system files them against a Goal or Area.
_Avoid_: Backlog, unsorted list

**Goal**:
A top-level, long-term outcome the user is working toward.
_Avoid_: Objective, target, mission

**Area**:
A named slice of a Goal — the categories of work that advance it.
_Avoid_: Category, domain, pillar

**Project**:
A concrete multi-week effort under an Area, composed of Quests.
_Avoid_: Initiative, epic

**System Message**:
A short, data-backed message from the system that communicates state, a bottleneck, or an adaptive change.
_Avoid_: Notification, alert, toast
