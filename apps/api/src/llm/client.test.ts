import { describe, expect, it } from "vitest";
import { createLlmClient, type LlmClient } from "./client";
import { LlmError, type LlmTransport, type SystemMessageInput, type WhyThisInput } from "./types";

const whyThisInput: WhyThisInput = {
  questTitle: "Ship the health tracer bullet",
  goalTitle: "Launch ASCENT MVP",
  areaTitle: "Backend",
};

const systemMessageInput: SystemMessageInput = {
  kind: "moved",
  questTitle: "Write release notes",
};

function clientWithTransport(transport: LlmTransport): LlmClient {
  return createLlmClient({ transport });
}

describe("LLM client", () => {
  it("returns the model's Why This text when the transport succeeds", async () => {
    const client = clientWithTransport(async () => ({ text: "Because it unblocks everything." }));

    const result = await client.explainWhy(whyThisInput);

    expect(result).toEqual({
      source: "llm",
      value: { text: "Because it unblocks everything." },
    });
  });

  it("falls back to a Why This template when the transport times out", async () => {
    const client = clientWithTransport(async () => {
      throw new LlmError("timeout", "LLM request timed out");
    });

    const result = await client.explainWhy(whyThisInput);

    expect(result).toEqual({
      source: "template",
      value: {
        text:
          "Complete Ship the health tracer bullet now because it directly advances Launch ASCENT MVP through Backend.",
      },
    });
  });

  it("returns the model's System Message text on success", async () => {
    const client = clientWithTransport(async () => ({ text: "Plan adapted." }));

    const result = await client.systemMessage(systemMessageInput);

    expect(result).toEqual({ source: "llm", value: { text: "Plan adapted." } });
  });

  it("falls back to a System Message template when the response is malformed", async () => {
    const client = clientWithTransport(async () => {
      throw new LlmError("malformed", "LLM response was not a chat completion");
    });

    const result = await client.systemMessage(systemMessageInput);

    expect(result).toEqual({
      source: "template",
      value: {
        text: "Running behind: I moved Write release notes to tomorrow so today's focus stays realistic.",
      },
    });
  });
});
