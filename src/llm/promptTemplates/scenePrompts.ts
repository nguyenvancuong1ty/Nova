import type { ChapterPlanEntry, ProductionInput, Scene } from "../../types";
import type { LlmMessage } from "../types";
import {
  buildMarkdownContract,
  buildStructuredArrayContract,
} from "./contracts";

export function buildSceneBreakdownPrompt(
  input: ProductionInput,
  chapterPlan: ChapterPlanEntry,
): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        `You are a scene architect. ${buildStructuredArrayContract({
          itemName: "scene",
          fields: [
            "id",
            "chapterNumber",
            "sceneNumber",
            "title",
            "location",
            "characters",
            "purpose",
            "summary",
            "visualFocus",
            "emotionalBeat",
            "videoPotential",
          ],
          cardinality: `between ${input.chapterConfig.scenesPerChapter.min} and ${input.chapterConfig.scenesPerChapter.max} items`,
          constraints: [
            `chapterNumber must be ${chapterPlan.chapterNumber} for every item.`,
            "sceneNumber must start at 1 and be sequential without duplicates.",
            "characters must be a non-empty array of character ids.",
            'videoPotential must be one of "low", "medium", or "high".',
          ],
        })}`,
    },
    {
      role: "user",
      content: JSON.stringify({ input, chapterPlan }),
    },
  ];
}

export function buildStoryboardPrompt(
  chapterNumber: number,
  scenes: Scene[],
): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        `You are a storyboard planner. ${buildMarkdownContract({
          title: `# Storyboard - Chapter ${String(chapterNumber).padStart(4, "0")}`,
          requiredSections: [
            "Location",
            "Characters",
            "Visual Focus",
            "Camera Direction",
            "Emotional Beat",
            "Sound Mood",
          ],
          sceneBased: true,
        })}`,
    },
    {
      role: "user",
      content: JSON.stringify({ chapterNumber, scenes }),
    },
  ];
}
