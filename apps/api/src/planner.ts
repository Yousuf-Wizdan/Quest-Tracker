import type { CognitiveLoad, EnergyLevel, Tier } from "@ascent/types";

export interface ImpactInput {
  goalPriority: number;
  importance: number;
  dueDate: string | null;
}

export interface PlannerQuestInput extends ImpactInput {
  id: string;
  title: string;
  planOrder: number;
  estimateMinutes: number;
  cognitiveLoad: CognitiveLoad;
  completed: boolean;
  tierOverride?: Tier;
}

export interface DailyQuest {
  id: string;
  title: string;
  planOrder: number;
  estimateMinutes: number;
  cognitiveLoad: CognitiveLoad;
  completed: boolean;
  tier: Tier;
  impactScore: number;
}

export interface DailyPlan {
  scheduled: DailyQuest[];
  moved: DailyQuest[];
}

export type ReplanOutcome = "KEEP" | "SHORTEN" | "MOVE" | "SKIP";

export interface ReplanDecision {
  questId: string;
  outcome: ReplanOutcome;
}

const OVERDUE_BONUS = 5;
const DUE_TODAY_BONUS = 3;
const DUE_THIS_WEEK_BONUS = 1;
const MUST_MIN_IMPACT = 18;
const SHOULD_MIN_IMPACT = 8;

function dayDiff(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000,
  );
}

export function computeImpactScore(input: ImpactInput, today: string): number {
  let urgencyBonus = 0;

  if (input.dueDate) {
    const diff = dayDiff(today, input.dueDate);
    if (diff < 0) urgencyBonus = OVERDUE_BONUS;
    else if (diff === 0) urgencyBonus = DUE_TODAY_BONUS;
    else if (diff <= 7) urgencyBonus = DUE_THIS_WEEK_BONUS;
  }

  return input.goalPriority * 2 + input.importance + urgencyBonus;
}

export function assignTier(input: PlannerQuestInput, energyLevel: EnergyLevel): Tier {
  if (input.tierOverride) {
    return input.tierOverride;
  }

  const impactScore = computeImpactScore(input, new Date().toISOString().slice(0, 10));

  if (energyLevel === "LOW") {
    return input.cognitiveLoad === "heavy" ? "SHOULD" : "MUST";
  }

  if (energyLevel === "HIGH") {
    return input.cognitiveLoad === "heavy" ? "MUST" : "SHOULD";
  }

  if (impactScore >= MUST_MIN_IMPACT) {
    return "MUST";
  }

  if (impactScore >= SHOULD_MIN_IMPACT) {
    return "SHOULD";
  }

  return "OPTIONAL";
}

const TIER_ORDER: Record<Tier, number> = {
  MUST: 0,
  SHOULD: 1,
  OPTIONAL: 2,
};

export function generateDailyPlan(
  quests: PlannerQuestInput[],
  options: { dailyBudgetMinutes: number; energyLevel: EnergyLevel; today: string },
): DailyPlan {
  const scheduled: DailyQuest[] = [];
  const moved: DailyQuest[] = [];
  let remaining = options.dailyBudgetMinutes;

  const ranked = [...quests].sort((a, b) => {
    const tierDiff = TIER_ORDER[assignTier(a, options.energyLevel)] - TIER_ORDER[assignTier(b, options.energyLevel)];
    if (tierDiff !== 0) return tierDiff;

    const impactDiff = computeImpactScore(b, options.today) - computeImpactScore(a, options.today);
    if (impactDiff !== 0) return impactDiff;

    return a.planOrder - b.planOrder;
  });

  for (const quest of ranked) {
    const dailyQuest: DailyQuest = {
      id: quest.id,
      title: quest.title,
      planOrder: quest.planOrder,
      estimateMinutes: quest.estimateMinutes,
      cognitiveLoad: quest.cognitiveLoad,
      completed: quest.completed,
      tier: assignTier(quest, options.energyLevel),
      impactScore: computeImpactScore(quest, options.today),
    };

    if (remaining >= quest.estimateMinutes) {
      scheduled.push(dailyQuest);
      remaining -= quest.estimateMinutes;
    } else {
      moved.push(dailyQuest);
    }
  }

  return { scheduled, moved };
}

export function currentFocus(scheduled: DailyQuest[]): { quest: DailyQuest; reason: string } | null {
  const ranked = [...scheduled]
    .filter((q) => !q.completed)
    .sort((a, b) => {
      const tierDiff = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
      if (tierDiff !== 0) return tierDiff;
      if (b.impactScore !== a.impactScore) return b.impactScore - a.impactScore;
      return a.planOrder - b.planOrder;
    });

  const top = ranked[0];
  if (!top) return null;

  return {
    quest: top,
    reason: `Top ${top.tier} Quest by Impact Score (${top.impactScore}).`,
  };
}

export function replan(scheduled: DailyQuest[], remainingBudgetMinutes: number): ReplanDecision[] {
  const ranked = [...scheduled].sort((a, b) => {
    const tierDiff = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
    if (tierDiff !== 0) return tierDiff;
    if (b.impactScore !== a.impactScore) return b.impactScore - a.impactScore;
    return a.planOrder - b.planOrder;
  });

  const decisions: ReplanDecision[] = [];
  let remaining = remainingBudgetMinutes;
  const primary = ranked[0];

  for (const quest of ranked) {
    if (quest === primary) {
      decisions.push({ questId: quest.id, outcome: "KEEP" });
      remaining -= quest.estimateMinutes;
      continue;
    }

    if (quest.tier === "OPTIONAL") {
      decisions.push({ questId: quest.id, outcome: remaining > 0 ? "MOVE" : "SKIP" });
      continue;
    }

    if (remaining >= quest.estimateMinutes) {
      decisions.push({ questId: quest.id, outcome: "KEEP" });
      remaining -= quest.estimateMinutes;
      continue;
    }

    if (quest.tier === "SHOULD" && remaining > 0) {
      decisions.push({ questId: quest.id, outcome: "SHORTEN" });
      continue;
    }

    decisions.push({ questId: quest.id, outcome: "SKIP" });
  }

  return decisions;
}
