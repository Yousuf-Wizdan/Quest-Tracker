export interface WhyThisInput {
  questTitle: string;
  goalTitle: string;
  areaTitle: string;
}

export interface ProposeStepsInput {
  questTitle: string;
}

export type SystemMessageKind = "moved" | "skipped" | "behind";

export interface SystemMessageInput {
  kind: SystemMessageKind;
  questTitle: string;
}

export interface LlmText {
  text: string;
}

export type LlmFailure = "timeout" | "malformed" | "network";

export class LlmError extends Error {
  readonly kind: LlmFailure;

  constructor(kind: LlmFailure, message: string) {
    super(message);
    this.name = "LlmError";
    this.kind = kind;
  }
}

export interface LlmTransport {
  (prompt: string, system: string): Promise<LlmText>;
}
