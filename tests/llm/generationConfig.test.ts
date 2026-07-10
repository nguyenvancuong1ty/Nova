import { describe, expect, it } from "vitest";
import { getGenerationConfig } from "../../src/llm/generationConfig";

describe("generation config", () => {
  it("defines structured output for arc plan generation", () => {
    const config = getGenerationConfig("generate_arc_plan");
    expect(config.outputMode).toBe("json");
    expect(config.tier).toBe("tier_planning");
    expect(config.maxTokens).toBe(20_000);
  });

  it("defines markdown output for chapter drafting", () => {
    const config = getGenerationConfig("generate_chapter_draft");
    expect(config.outputMode).toBe("markdown");
    expect(config.tier).toBe("tier_longform");
    expect(config.maxTokens).toBe(20_000);
  });
});
