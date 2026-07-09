import { describe, expect, it } from "vitest";
import { createLlmConfig } from "../../src/config/llmConfig";
import { loadEnvConfig } from "../../src/config/env";

describe("loadEnvConfig", () => {
  it("reads the required OpenRouter API key and tier model ids", () => {
    const env = loadEnvConfig({
      OPENROUTER_API_KEY: "sk-test",
      OPENROUTER_MODEL_TIER_PLANNING: "openrouter/planning",
      OPENROUTER_MODEL_TIER_LONGFORM: "openrouter/longform",
      OPENROUTER_MODEL_TIER_SCENE: "openrouter/scene",
      OPENROUTER_MODEL_TIER_ADAPTATION: "openrouter/adaptation",
      OPENROUTER_MODEL_TIER_UTILITY: "openrouter/utility",
    });

    const config = createLlmConfig(env);
    expect(config.apiKey).toBe("sk-test");
    expect(config.models.tier_planning).toBe("openrouter/planning");
    expect(config.models.tier_utility).toBe("openrouter/utility");
  });

  it("throws when a required tier model is missing", () => {
    expect(() =>
      loadEnvConfig({
        OPENROUTER_API_KEY: "sk-test",
        OPENROUTER_MODEL_TIER_PLANNING: "openrouter/planning",
      }),
    ).toThrow(/OPENROUTER_MODEL_TIER_LONGFORM/i);
  });
});
