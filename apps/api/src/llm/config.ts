import { createHttpLlmTransport, type LlmConfig } from "./transport";

export function createLlmConfig(env: NodeJS.ProcessEnv = process.env): LlmConfig | null {
  const baseUrl = env.LLM_BASE_URL;
  const apiKey = env.LLM_API_KEY;
  const model = env.LLM_MODEL;

  if (!baseUrl || !apiKey || !model) {
    return null;
  }

  return {
    baseUrl,
    apiKey,
    model,
    timeoutMs: 10_000,
  };
}

export function createConfiguredLlmTransport(env: NodeJS.ProcessEnv = process.env) {
  const config = createLlmConfig(env);
  if (!config) {
    return null;
  }

  return createHttpLlmTransport(config);
}
