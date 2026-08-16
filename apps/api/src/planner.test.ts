import { describe, expect, it } from "vitest";
import {
  assignTier,
  computeImpactScore,
  currentFocus,
  generateDailyPlan,
  replan,
  type DailyQuest,
  type PlannerQuestInput,
} from "./planner";

const TODAY = "2026-08-16";

function quest(overrides: Partial<PlannerQuestInput> & { id: string }): PlannerQuestInput {
  return {
    goalPriority: 5,
    importance: 10,
    planOrder: 0,
    dueDate: null,
    estimateMinutes: 60,
    cognitiveLoad: "standard",
    completed: false,
    ...overrides,
  };
}

describe("planner", () => {
  it("computes the Impact Score from goal priority, importance, and urgency", () => {
    expect(computeImpactScore({ goalPriority: 5, importance: 10, dueDate: null }, TODAY)).toBe(20);
  });

  it("adds the due-today urgency bonus", () => {
    expect(computeImpactScore({ goalPriority: 5, importance: 10, dueDate: TODAY }, TODAY)).toBe(23);
  });

  it("adds the overdue urgency bonus", () => {
    expect(computeImpactScore({ goalPriority: 5, importance: 10, dueDate: "2026-08-15" }, TODAY)).toBe(25);
  });

  it("assigns a MUST Tier to a high-impact Quest", () => {
    expect(assignTier(quest({ id: "q1" }), "NORMAL")).toBe("MUST");
  });

  it("honours a user Tier override", () => {
    expect(assignTier(quest({ id: "q1", tierOverride: "OPTIONAL" }), "NORMAL")).toBe("OPTIONAL");
  });

  it("demotes heavy Quests on a LOW-energy day", () => {
    expect(assignTier(quest({ id: "q1", cognitiveLoad: "heavy" }), "LOW")).toBe("SHOULD");
  });

  it("keeps light Quests favored on a LOW-energy day", () => {
    expect(assignTier(quest({ id: "q1", cognitiveLoad: "light" }), "LOW")).toBe("MUST");
  });

  it("favours heavy Quests on a HIGH-energy day", () => {
    expect(assignTier(quest({ id: "q1", cognitiveLoad: "heavy" }), "HIGH")).toBe("MUST");
  });

  it("demotes light Quests on a HIGH-energy day", () => {
    expect(assignTier(quest({ id: "q1", cognitiveLoad: "light" }), "HIGH")).toBe("SHOULD");
  });

  it("assigns an OPTIONAL Tier to a low-impact Quest", () => {
    expect(assignTier(quest({ id: "q1", goalPriority: 1, importance: 1 }), "NORMAL")).toBe("OPTIONAL");
  });

  it("generates a daily plan that fits Quests within the Daily Budget", () => {
    const plan = generateDailyPlan(
      [
        quest({ id: "a", planOrder: 0, estimateMinutes: 60 }),
        quest({ id: "b", planOrder: 1, estimateMinutes: 60 }),
      ],
      { dailyBudgetMinutes: 120, energyLevel: "NORMAL", today: TODAY },
    );

    expect(plan.scheduled.map((q) => q.id)).toEqual(["a", "b"]);
    expect(plan.moved).toEqual([]);
  });

  it("moves Quests that no longer fit the Daily Budget", () => {
    const plan = generateDailyPlan(
      [
        quest({ id: "a", planOrder: 0, estimateMinutes: 90 }),
        quest({ id: "b", planOrder: 1, estimateMinutes: 90 }),
      ],
      { dailyBudgetMinutes: 120, energyLevel: "NORMAL", today: TODAY },
    );

    expect(plan.scheduled.map((q) => q.id)).toEqual(["a"]);
    expect(plan.moved.map((q) => q.id)).toEqual(["b"]);
  });

  it("returns the top unfinished Quest as Current Focus", () => {
    const plan = generateDailyPlan(
      [
        quest({ id: "must-2", planOrder: 1, estimateMinutes: 60 }),
        quest({ id: "must-1", planOrder: 0, estimateMinutes: 60 }),
      ],
      { dailyBudgetMinutes: 200, energyLevel: "NORMAL", today: TODAY },
    );

    expect(currentFocus(plan.scheduled)).toEqual({
      quest: expect.objectContaining({ id: "must-1" }),
      reason: expect.any(String),
    });
  });

  it("skips completed Quests when ranking the Current Focus", () => {
    const plan = generateDailyPlan(
      [
        quest({ id: "done-first", planOrder: 0, completed: true, estimateMinutes: 60 }),
        quest({ id: "next", planOrder: 1, estimateMinutes: 60 }),
      ],
      { dailyBudgetMinutes: 200, energyLevel: "NORMAL", today: TODAY },
    );

    expect(currentFocus(plan.scheduled)?.quest.id).toBe("next");
  });

  it("replans with KEEP, SHORTEN, MOVE, and SKIP while protecting the primary objective", () => {
    const scheduled: DailyQuest[] = [
      { ...quest({ id: "primary", estimateMinutes: 90 }), tier: "MUST", impactScore: 30 },
      { ...quest({ id: "should", estimateMinutes: 60 }), tier: "SHOULD", impactScore: 12 },
      { ...quest({ id: "optional", estimateMinutes: 30 }), tier: "OPTIONAL", impactScore: 4 },
    ];

    const decisions = replan(scheduled, 100);

    expect(decisions.find((d) => d.questId === "primary")?.outcome).toBe("KEEP");
    expect(decisions.find((d) => d.questId === "should")?.outcome).toBe("SHORTEN");
    expect(decisions.find((d) => d.questId === "optional")?.outcome).toBe("MOVE");
  });

  it("SKIPs the least important item when the day is far over budget", () => {
    const scheduled: DailyQuest[] = [
      { ...quest({ id: "primary", estimateMinutes: 90 }), tier: "MUST", impactScore: 30 },
      { ...quest({ id: "should", estimateMinutes: 60 }), tier: "SHOULD", impactScore: 12 },
      { ...quest({ id: "optional", estimateMinutes: 30 }), tier: "OPTIONAL", impactScore: 4 },
    ];

    const decisions = replan(scheduled, 30);

    expect(decisions.find((d) => d.questId === "primary")?.outcome).toBe("KEEP");
    expect(decisions.find((d) => d.questId === "optional")?.outcome).toBe("SKIP");
  });
});
