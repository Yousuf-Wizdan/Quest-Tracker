import type { LlmText, ProposeStepsInput, WhyThisInput, SystemMessageInput } from "./types";

export function renderWhyThisTemplate(input: WhyThisInput): LlmText {
  return {
    text: `Complete ${input.questTitle} now because it directly advances ${input.goalTitle} through ${input.areaTitle}.`,
  };
}

export function renderProposeStepsTemplate(input: ProposeStepsInput): LlmText {
  return {
    text: `Break ${input.questTitle} into a warm-up, a focused middle step, and a review step.`,
  };
}

export function renderSystemMessageTemplate(input: SystemMessageInput): LlmText {
  const moved = `Running behind: I moved ${input.questTitle} to tomorrow so today's focus stays realistic.`;
  const skipped = `Running behind: I skipped ${input.questTitle} so the primary objective keeps the time it needs.`;
  const behind = `You're behind on ${input.questTitle} — the rest of today's plan has been adjusted to protect your main objective.`;

  const text: Record<SystemMessageInput["kind"], string> = {
    moved,
    skipped,
    behind,
  };

  return { text: text[input.kind] };
}
