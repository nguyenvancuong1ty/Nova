import { describe, expect, it } from "vitest";
import { resolveTierForStep } from "../../src/llm/modelTiers";

describe("model tier resolution", () => {
  it("maps planning steps to the planning tier", () => {
    expect(resolveTierForStep("generate_story_bible")).toBe("tier_planning");
    expect(resolveTierForStep("generate_chapter_plan")).toBe("tier_planning");
  });

  it("maps subtitle generation to the utility tier", () => {
    expect(resolveTierForStep("generate_subtitles")).toBe("tier_utility");
  });
});
