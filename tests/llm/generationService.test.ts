import { z } from "zod";
import { describe, expect, it, vi } from "vitest";
import { createGenerationService } from "../../src/llm/generationService";

describe("generationService", () => {
  it("routes a structured step through the configured tier and parser", async () => {
    const client = {
      generate: vi.fn().mockResolvedValue({
        content: '{"title":"Arc 1"}',
        raw: {},
      }),
    };

    const service = createGenerationService({
      client,
      models: {
        tier_planning: "model/planning",
        tier_longform: "model/longform",
        tier_scene: "model/scene",
        tier_adaptation: "model/adaptation",
        tier_utility: "model/utility",
      },
    });

    const result = await service.generateStructured({
      step: "generate_arc_plan",
      schema: z.object({ title: z.string() }),
      messages: [{ role: "user", content: "Return arc JSON" }],
    });

    expect(client.generate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "model/planning" }),
    );
    expect(result.data.title).toBe("Arc 1");
  });
});
