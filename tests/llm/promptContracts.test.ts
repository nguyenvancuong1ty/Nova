import { describe, expect, it } from "vitest";
import { validProductionInput } from "../fixtures/validProductionInput";
import {
  buildArcPlanPrompt,
  buildChapterPlanPrompt,
  buildCharacterBiblePrompt,
  buildStoryBiblePrompt,
  buildWorldBiblePrompt,
} from "../../src/llm/promptTemplates/planningPrompts";
import {
  buildImagePromptPrompt,
  buildVideoPromptPrompt,
  buildVoiceoverPrompt,
} from "../../src/llm/promptTemplates/adaptationPrompts";
import {
  buildChapterDraftPrompt,
  buildRevisionPrompt,
} from "../../src/llm/promptTemplates/longformPrompts";
import {
  buildSceneBreakdownPrompt,
  buildStoryboardPrompt,
} from "../../src/llm/promptTemplates/scenePrompts";
import { buildSubtitlePrompt } from "../../src/llm/promptTemplates/utilityPrompts";

const chapterPlan = {
  chapterNumber: 1,
  title: "Chapter 1",
  arcId: "arc-01",
  mainGoal: "Goal",
  mainConflict: "Conflict",
  requiredCharacters: ["protagonist"],
  requiredLocations: ["Ruined chapel"],
  emotionalBeat: "Dread",
  mysteryProgress: "Clue",
  romanceProgress: "Trust",
  endingHook: "Hook",
  videoFocus: "Focus",
};

const scenes = [
  {
    id: "scene-1",
    chapterNumber: 1,
    sceneNumber: 1,
    title: "Arrival",
    location: "Ruined chapel",
    characters: ["protagonist"],
    purpose: "Introduce relic",
    summary: "Arin arrives.",
    visualFocus: "Moonlit altar",
    emotionalBeat: "Dread",
    videoPotential: "high" as const,
  },
];

function systemContract(messages: Array<{ role: string; content: string }>) {
  return messages.find((message) => message.role === "system")?.content ?? "";
}

describe("prompt contracts", () => {
  it("requires explicit array contracts for every structured output step", () => {
    const contracts = [
      systemContract(buildArcPlanPrompt(validProductionInput)),
      systemContract(buildChapterPlanPrompt(validProductionInput, [])),
      systemContract(buildSceneBreakdownPrompt(validProductionInput, chapterPlan)),
      systemContract(buildImagePromptPrompt(validProductionInput, 1, scenes)),
      systemContract(buildVideoPromptPrompt(validProductionInput, 1, scenes)),
      systemContract(buildSubtitlePrompt(1, scenes)),
    ];

    for (const contract of contracts) {
      expect(contract).toMatch(/top-level JSON array/i);
      expect(contract).toMatch(/never wrap/i);
      expect(contract).toMatch(/markdown fences/i);
    }
  });

  it("requires stable markdown structure for prose outputs", () => {
    const revisionReport = {
      status: "PASS" as const,
      issues: [],
      characterConsistency: [],
      timelineConsistency: [],
      worldbuildingConsistency: [],
      visualConsistency: [],
      videoAdaptationNotes: [],
      recommendedFixes: [],
      markdown: "",
    };
    const contracts = [
      systemContract(buildStoryBiblePrompt(validProductionInput)),
      systemContract(buildWorldBiblePrompt(validProductionInput)),
      systemContract(buildCharacterBiblePrompt(validProductionInput)),
      systemContract(buildChapterDraftPrompt(validProductionInput, chapterPlan)),
      systemContract(buildRevisionPrompt("# Chapter 1", revisionReport)),
      systemContract(buildStoryboardPrompt(1, scenes)),
      systemContract(buildVoiceoverPrompt(1, scenes)),
    ];

    for (const contract of contracts) {
      expect(contract).toMatch(/markdown/i);
      expect(contract).toMatch(/heading/i);
    }
  });
});
