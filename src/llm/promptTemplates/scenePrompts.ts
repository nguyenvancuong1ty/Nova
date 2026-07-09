import type { ChapterPlanEntry, ProductionInput, Scene } from "../../types";
import type { LlmMessage } from "../types";

export function buildSceneBreakdownPrompt(
  input: ProductionInput,
  chapterPlan: ChapterPlanEntry,
): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a scene architect. Return valid JSON only for the requested scene breakdown.",
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
        "You are a storyboard planner. Write concise Vietnamese markdown grouped by scene.",
    },
    {
      role: "user",
      content: JSON.stringify({ chapterNumber, scenes }),
    },
  ];
}
