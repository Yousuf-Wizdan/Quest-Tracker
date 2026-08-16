import { describe, expect, it, vi } from "vitest";
import { createHttpLlmTransport, type LlmConfig } from "./transport";
import { LlmError } from "./types";

const config: LlmConfig = {
  baseUrl: "https://llm.example.com/v1",
  apiKey: "secret",
  model: "deepseek/deepseek-v4-flash",
  timeoutMs: 5_000,
};

function fetchReturning(body: unknown, ok = true) {
  const response = new Response(JSON.stringify(body), {
    status: ok ? 200 : 500,
    headers: { "content-type": "application/json" },
  });

  return vi.fn<typeof fetch>().mockResolvedValue(response);
}

describe("HTTP LLM transport", () => {
  it("calls the OpenAI-compatible chat completions endpoint and returns the message text", async () => {
    const fetchMock = fetchReturning({
      choices: [{ message: { content: "Deterministic answer." } }],
    });

    const transport = createHttpLlmTransport(config, fetchMock);
    const result = await transport("What should the system say?", "You are a planner.");

    expect(result.text).toBe("Deterministic answer.");

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://llm.example.com/v1/chat/completions");

    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(body.model).toBe("deepseek/deepseek-v4-flash");
    expect(init?.headers).toMatchObject({
      "content-type": "application/json",
      authorization: "Bearer secret",
    });
    expect(body.messages).toEqual([
      { role: "system", content: "You are a planner." },
      { role: "user", content: "What should the system say?" },
    ]);
  });

  it("surfaces a timeout failure instead of hanging", async () => {
    vi.useFakeTimers();
    try {
      const fetchMock = vi.fn<typeof fetch>().mockImplementation(
        (_input, init) =>
          new Promise((_resolve, reject) => {
            const signal = (init as RequestInit).signal;
            signal?.addEventListener("abort", () =>
              reject(new DOMException("The operation timed out", "TimeoutError")),
            );
          }),
      ) as unknown as typeof fetch;

      const transport = createHttpLlmTransport({ ...config, timeoutMs: 50 }, fetchMock);
      const resultPromise = transport("ping", "system");

      await vi.advanceTimersByTimeAsync(51);

      await expect(resultPromise).rejects.toEqual(new LlmError("timeout", "LLM request timed out"));
    } finally {
      vi.useRealTimers();
    }
  });

  it("surfaces a malformed-response failure when the body is not a chat completion", async () => {
    const fetchMock = fetchReturning({ unexpected: true });

    const transport = createHttpLlmTransport(config, fetchMock);

    await expect(transport("ping", "system")).rejects.toEqual(
      new LlmError("malformed", "LLM response was not a chat completion"),
    );
  });

  it("surfaces a malformed-response failure on a non-2xx HTTP status", async () => {
    const fetchMock = fetchReturning(
      { choices: [{ message: { content: "Should not be accepted." } }] },
      false,
    );

    const transport = createHttpLlmTransport(config, fetchMock);

    await expect(transport("ping", "system")).rejects.toEqual(
      new LlmError("malformed", "LLM response was not a chat completion"),
    );
  });
});
