import { LlmError, type LlmText, type LlmTransport, type SystemMessageInput, type WhyThisInput } from "./types";
import { renderSystemMessageTemplate, renderWhyThisTemplate } from "./templates";

export interface LlmResult {
  source: "llm" | "template";
  value: LlmText;
}

export interface LlmClientDeps {
  transport: LlmTransport;
}

export interface LlmClient {
  explainWhy(input: WhyThisInput): Promise<LlmResult>;
  systemMessage(input: SystemMessageInput): Promise<LlmResult>;
}

const WHY_SYSTEM = "You are ASCENT's planner. Explain the connection between today's Quest and the user's bigger Goal in one sentence.";
const MESSAGE_SYSTEM = "You are ASCENT's planner. Write a short, data-backed System Message in one sentence.";

export function createLlmClient(deps: LlmClientDeps): LlmClient {
  async function withFallback(prompt: string, system: string, fallback: LlmText): Promise<LlmResult> {
    try {
      const value = await deps.transport(prompt, system);
      return { source: "llm", value };
    } catch (error) {
      if (error instanceof LlmError) {
        return { source: "template", value: fallback };
      }
      throw error;
    }
  }

  return {
    explainWhy(input: WhyThisInput): Promise<LlmResult> {
      const prompt = `Quest: ${input.questTitle}\nGoal: ${input.goalTitle}\nArea: ${input.areaTitle}`;
      return withFallback(prompt, WHY_SYSTEM, renderWhyThisTemplate(input));
    },

    systemMessage(input: SystemMessageInput): Promise<LlmResult> {
      const prompt = `Kind: ${input.kind}\nQuest: ${input.questTitle}`;
      return withFallback(prompt, MESSAGE_SYSTEM, renderSystemMessageTemplate(input));
    },
  };
}
