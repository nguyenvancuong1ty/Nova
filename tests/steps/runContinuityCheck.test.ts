import { describe, expect, it } from "vitest";
import { runContinuityCheck } from "../../src/steps/runContinuityCheck";

describe("runContinuityCheck", () => {
  it("warns about unknown characters and missing visual focus", async () => {
    const report = await runContinuityCheck({
      chapterNumber: 1,
      expectedSceneRange: { min: 2, max: 3 },
      scenes: [
        {
          id: "scene-1",
          chapterNumber: 1,
          sceneNumber: 1,
          title: "Gate",
          location: "City gate",
          characters: ["unknown"],
          purpose: "Arrival",
          summary: "A tense arrival",
          visualFocus: "",
          emotionalBeat: "Tension",
          videoPotential: "medium",
        },
      ],
      chapterPlan: {
        endingHook: "A scream in the alley",
        requiredCharacters: ["protagonist"],
      },
      knownCharacterIds: ["protagonist"],
    });

    expect(report.status).toBe("WARN");
    expect(report.issues.join("\n")).toContain("unknown character");
    expect(report.issues.join("\n")).toContain("visual focus");
  });
});
