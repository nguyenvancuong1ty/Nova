import { describe, expect, it } from "vitest";
import { ProductionInputSchema } from "../../src/schemas/productionInput.schema";
import { SceneSchema } from "../../src/schemas/scene.schema";

const validInput = {
  project: {
    title: "The Shadow Crown",
    creatorName: "Nova",
    language: "Vietnamese",
    format: "webnovel",
    genres: ["dark fantasy"],
    tone: "dramatic",
    targetAudience: "young adult",
  },
  story: {
    mainPremise: "A cursed crown awakens.",
    mainConflict: "Power demands sacrifice.",
    endingDirection: "Bittersweet victory",
    openingSituation: "A ruined chapel discovery",
    mainMystery: "Who forged the crown?",
    romanceAngle: "Slow burn alliance",
    powerSystemNotes: "Relics bind memory",
    importantThemes: ["power", "identity"],
  },
  world: {
    worldSetting: "Fallen kingdom",
    worldRules: "Relics demand a cost",
    magicSystem: "Blood-bound artifacts",
    importantLocations: ["Ruined chapel"],
    importantOrganizations: ["The Ash Court"],
    technologyLevel: "pre-industrial",
    socialStructure: "noble houses",
  },
  characters: [
    {
      id: "protagonist",
      name: "Arin",
      role: "protagonist",
      visualDescription: "Black hair, silver eyes",
    },
    {
      id: "antagonist",
      name: "Veyra",
      role: "antagonist",
      visualDescription: "White armor, gold mask",
    },
  ],
  video: {
    videoFormat: "short-episode",
    aspectRatio: "16:9",
    visualStyle: "cinematic dark fantasy anime-realism",
    cameraStyle: "slow cinematic camera movement",
    imageStyleNotes: "moonlit contrast",
    videoMotionStyle: "subtle atmospheric motion",
    voiceoverStyle: "dramatic narration",
    subtitleStyle: "clean readable subtitles",
  },
  chapterConfig: {
    totalChapters: 1,
    targetWordsPerChapter: { min: 1800, max: 2500 },
    scenesPerChapter: { min: 8, max: 12 },
  },
};

describe("ProductionInputSchema", () => {
  it("accepts valid production input", () => {
    expect(ProductionInputSchema.parse(validInput).project.title).toBe(
      "The Shadow Crown",
    );
  });

  it("rejects missing title", () => {
    expect(() =>
      ProductionInputSchema.parse({
        ...validInput,
        project: { ...validInput.project, title: "" },
      }),
    ).toThrow();
  });

  it("rejects invalid total chapters", () => {
    expect(() =>
      ProductionInputSchema.parse({
        ...validInput,
        chapterConfig: { ...validInput.chapterConfig, totalChapters: 0 },
      }),
    ).toThrow();
  });
});

describe("SceneSchema", () => {
  it("rejects scenes without visual focus", () => {
    expect(() =>
      SceneSchema.parse({
        id: "scene-1",
        chapterNumber: 1,
        sceneNumber: 1,
        title: "Arrival",
        location: "Chapel",
        characters: ["protagonist"],
        purpose: "Introduce relic",
        summary: "Arin arrives",
        visualFocus: "",
        emotionalBeat: "Dread",
        videoPotential: "high",
      }),
    ).toThrow();
  });
});
