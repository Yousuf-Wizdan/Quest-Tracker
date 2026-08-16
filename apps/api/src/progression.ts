import type { AttributeMap, Tier } from "@ascent/types";

export interface ProgressionState {
  totalXp: number;
  attributes: AttributeMap;
  streak: number;
  lastStreakDate: string | null;
}

export interface QuestCompletionInput {
  xpReward: number;
  attributeGains: Partial<AttributeMap>;
  tier: Tier;
  completedDate: string;
}

export interface FocusSessionInput {
  questXpReward: number;
  questEstimateMinutes: number;
  focusedMinutes: number;
}

const LEVEL_XP = 10_000;
const MIN_FOCUS_MINUTES = 10;
const FOC_GAIN_INTERVAL_MINUTES = 30;

const ATTRIBUTE_KEYS: Array<keyof AttributeMap> = ["STR", "INT", "VIT", "FOC", "DIS", "CON"];

function emptyAttributes(): AttributeMap {
  return Object.fromEntries(ATTRIBUTE_KEYS.map((key) => [key, 0])) as AttributeMap;
}

function dayDiff(from: string, to: string): number {
  const fromUtc = Date.parse(`${from}T00:00:00Z`);
  const toUtc = Date.parse(`${to}T00:00:00Z`);

  return Math.round((toUtc - fromUtc) / 86_400_000);
}

export function computeLevel(totalXp: number) {
  const level = Math.floor(totalXp / LEVEL_XP) + 1;
  const xpIntoLevel = totalXp % LEVEL_XP;

  return {
    level,
    xpIntoLevel,
    xpToNext: LEVEL_XP - xpIntoLevel,
  };
}

export function createInitialState(): ProgressionState {
  return {
    totalXp: 0,
    attributes: emptyAttributes(),
    streak: 0,
    lastStreakDate: null,
  };
}

export function applyQuestCompletion(state: ProgressionState, input: QuestCompletionInput): ProgressionState {
  const attributes = { ...state.attributes };
  for (const key of ATTRIBUTE_KEYS) {
    const gain = input.attributeGains[key] ?? 0;
    attributes[key] += gain;
  }

  const streak = updateStreak(state, input.tier, input.completedDate);

  return {
    totalXp: state.totalXp + input.xpReward,
    attributes,
    ...streak,
  };
}

export function applyFocusSession(state: ProgressionState, input: FocusSessionInput): ProgressionState {
  const xp = partialFocusXp(input);

  const attributes = { ...state.attributes };
  attributes.FOC += Math.floor(input.focusedMinutes / FOC_GAIN_INTERVAL_MINUTES);

  return {
    totalXp: state.totalXp + xp,
    attributes,
    streak: state.streak,
    lastStreakDate: state.lastStreakDate,
  };
}

function partialFocusXp(input: FocusSessionInput): number {
  if (input.focusedMinutes < MIN_FOCUS_MINUTES) {
    return 0;
  }

  const ratio = input.focusedMinutes / input.questEstimateMinutes;
  const raw = Math.round((input.questXpReward * ratio) / 5) * 5;

  return Math.min(raw, input.questXpReward);
}

function updateStreak(
  state: ProgressionState,
  tier: Tier,
  completedDate: string,
): Pick<ProgressionState, "streak" | "lastStreakDate"> {
  if (tier !== "MUST") {
    return { streak: state.streak, lastStreakDate: state.lastStreakDate };
  }

  if (state.lastStreakDate === null) {
    return { streak: 1, lastStreakDate: completedDate };
  }

  const diff = dayDiff(state.lastStreakDate, completedDate);
  if (diff === 0) {
    return { streak: state.streak, lastStreakDate: state.lastStreakDate };
  }

  if (diff === 1) {
    return { streak: state.streak + 1, lastStreakDate: completedDate };
  }

  if (diff > 1) {
    return { streak: 1, lastStreakDate: completedDate };
  }

  return { streak: state.streak, lastStreakDate: state.lastStreakDate };
}
