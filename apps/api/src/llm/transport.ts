import { LlmError, type LlmText, type LlmTransport } from "./types";

export interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
}

interface ChatCompletionBody {
  choices?: Array<{ message?: { content?: unknown } }>;
}

function isAbort(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}

export function createHttpLlmTransport(config: LlmConfig, fetchImpl: typeof fetch = fetch): LlmTransport {
  return async (prompt: string, system: string): Promise<LlmText> => {
    const url = `${config.baseUrl.replace(/\/+$/, "")}/chat/completions`;

    let response: Response;
    try {
      response = await fetchImpl(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
        }),
        signal: AbortSignal.timeout(config.timeoutMs),
      });
    } catch (error) {
      if (isAbort(error)) {
        throw new LlmError("timeout", "LLM request timed out");
      }
      throw new LlmError("network", "LLM request failed");
    }

    if (!response.ok) {
      throw new LlmError("malformed", "LLM response was not a chat completion");
    }

    let body: ChatCompletionBody;
    try {
      body = (await response.json()) as ChatCompletionBody;
    } catch {
      throw new LlmError("malformed", "LLM response was not a chat completion");
    }

    const content = body.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.trim().length === 0) {
      throw new LlmError("malformed", "LLM response was not a chat completion");
    }

    return { text: content };
  };
}
