import { describe, expect, it, vi } from "vitest";
import { createOpenRouterClient } from "../../src/llm/openrouterClient";

describe("openrouterClient", () => {
  it("sends a chat completion request with auth and model metadata", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "hello" } }],
      }),
    });

    const client = createOpenRouterClient({
      apiKey: "sk-test",
      baseUrl: "https://openrouter.ai/api/v1",
      fetchImpl: fetchMock as typeof fetch,
      appName: "Nova",
    });

    const result = await client.generate({
      model: "openrouter/planning",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.content).toBe("hello");
  });

  it("throws a normalized error on non-2xx responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    const client = createOpenRouterClient({
      apiKey: "sk-test",
      baseUrl: "https://openrouter.ai/api/v1",
      fetchImpl: fetchMock as typeof fetch,
    });

    await expect(
      client.generate({
        model: "openrouter/planning",
        messages: [{ role: "user", content: "hi" }],
      }),
    ).rejects.toThrow(/401/i);
  });

  it("retries when the provider returns reasoning without final content", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              finish_reason: "length",
              message: {
                content: null,
                reasoning: "thinking...",
              },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "final answer" } }],
        }),
      });

    const client = createOpenRouterClient({
      apiKey: "sk-test",
      baseUrl: "https://openrouter.ai/api/v1",
      fetchImpl: fetchMock as typeof fetch,
    });

    const result = await client.generate({
      model: "openrouter/planning",
      messages: [{ role: "user", content: "hi" }],
      max_tokens: 32,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondBody = JSON.parse(
      String(fetchMock.mock.calls[1]?.[1]?.body ?? "{}"),
    ) as { max_tokens?: number };
    expect(secondBody.max_tokens).toBeGreaterThan(32);
    expect(result.content).toBe("final answer");
  });
});
