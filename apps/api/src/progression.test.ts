import { describe, expect, it } from "vitest";
import {
  applyFocusSession,
  applyQuestCompletion,
  computeLevel,
  createInitialState,
  type ProgressionState,
} from "./progression";

describe("progression engine", () => {
  it("derives Level 27 from 268,420 cumulative XP", () => {
    expect(computeLevel(268_420)).toEqual({
      level: 27,
      xpIntoLevel: 8_420,
      xpToNext: 1_580,
    });
  });

  it("starts a fresh account at Level 1 with no XP", () => {
    expect(computeLevel(0)).toEqual({
      level: 1,
      xpIntoLevel: 0,
      xpToNext: 10_000,
    });
  });

  it("carries XP overflow into the next Level", () => {
    const state = applyQuestCompletion(
      { ...createInitialState(), totalXp: 9_950 },
      {
        xpReward: 100,
        attributeGains: {},
        tier: "SHOULD",
        completedDate: "2026-08-16",
      },
    );

    expect(state.totalXp).toBe(10_050);
    expect(computeLevel(state.totalXp)).toMatchObject({
      level: 2,
      xpIntoLevel: 50,
    });
  });

  it("applies a Quest's full reward and attribute gains", () => {
    const state = applyQuestCompletion(
      { ...createInitialState(), attributes: { STR: 5, INT: 0, VIT: 0, FOC: 0, DIS: 0, CON: 0 } },
      {
        xpReward: 45,
        attributeGains: { INT: 2, VIT: 3 },
        tier: "MUST",
        completedDate: "2026-08-16",
      },
    );

    expect(state.totalXp).toBe(45);
    expect(state.attributes).toEqual({ STR: 5, INT: 2, VIT: 3, FOC: 0, DIS: 0, CON: 0 });
  });

  it("increments the Streak on consecutive MUST-completion days", () => {
    let state = createInitialState();

    state = applyQuestCompletion(state, {
      xpReward: 10,
      attributeGains: {},
      tier: "MUST",
      completedDate: "2026-08-14",
    });
    state = applyQuestCompletion(state, {
      xpReward: 10,
      attributeGains: {},
      tier: "MUST",
      completedDate: "2026-08-15",
    });

    expect(state.streak).toBe(2);
  });

  it("keeps the Streak when another MUST Quest completes the same day", () => {
    let state = createInitialState();

    state = applyQuestCompletion(state, {
      xpReward: 10,
      attributeGains: {},
      tier: "MUST",
      completedDate: "2026-08-14",
    });
    state = applyQuestCompletion(state, {
      xpReward: 10,
      attributeGains: {},
      tier: "MUST",
      completedDate: "2026-08-14",
    });

    expect(state.streak).toBe(1);
  });

  it("resets the Streak to 1 when a day is missed", () => {
    let state = createInitialState();

    state = applyQuestCompletion(state, {
      xpReward: 10,
      attributeGains: {},
      tier: "MUST",
      completedDate: "2026-08-14",
    });
    state = applyQuestCompletion(state, {
      xpReward: 10,
      attributeGains: {},
      tier: "MUST",
      completedDate: "2026-08-16",
    });

    expect(state.streak).toBe(1);
  });

  it("does not change the Streak for a SHOULD completion", () => {
    const state = applyQuestCompletion(createInitialState(), {
      xpReward: 10,
      attributeGains: {},
      tier: "SHOULD",
      completedDate: "2026-08-16",
    });

    expect(state.streak).toBe(0);
  });

  it("earns time-proportional Focus XP rounded to the nearest 5", () => {
    const state = applyFocusSession(createInitialState(), {
      questXpReward: 45,
      questEstimateMinutes: 90,
      focusedMinutes: 30,
    });

    expect(state.totalXp).toBe(15);
  });

  it("earns no Focus XP under the 10-minute minimum", () => {
    const state = applyFocusSession(createInitialState(), {
      questXpReward: 45,
      questEstimateMinutes: 90,
      focusedMinutes: 9,
    });

    expect(state.totalXp).toBe(0);
  });

  it("caps partial Focus XP at the full Quest reward", () => {
    const state = applyFocusSession(createInitialState(), {
      questXpReward: 45,
      questEstimateMinutes: 90,
      focusedMinutes: 120,
    });

    expect(state.totalXp).toBe(45);
  });

  it("grows FOC from focused time", () => {
    const state = applyFocusSession(createInitialState(), {
      questXpReward: 45,
      questEstimateMinutes: 90,
      focusedMinutes: 45,
    });

    expect(state.attributes.FOC).toBe(1);
  });
});
