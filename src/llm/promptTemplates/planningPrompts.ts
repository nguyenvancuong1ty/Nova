import type { ProductionInput } from "../../types";
import type { LlmMessage } from "../types";

export function buildStoryBiblePrompt(input: ProductionInput): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a senior novel planner. Write structured markdown in Vietnamese.",
    },
    {
      role: "user",
      content: JSON.stringify(input),
    },
  ];
}

export function buildWorldBiblePrompt(input: ProductionInput): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a worldbuilding planner. Produce coherent Vietnamese markdown.",
    },
    {
      role: "user",
      content: JSON.stringify(input),
    },
  ];
}

export function buildCharacterBiblePrompt(
  input: ProductionInput,
): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a character designer. Produce a character bible in Vietnamese markdown.",
    },
    {
      role: "user",
      content: JSON.stringify(input),
    },
  ];
}

export function buildArcPlanPrompt(input: ProductionInput): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a story architect. Return only valid JSON for an arc plan.",
    },
    {
      role: "user",
      content: JSON.stringify(input),
    },
  ];
}

export function buildChapterPlanPrompt(input: ProductionInput, arcs: unknown): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a serial novel planner. Return only valid JSON for a chapter plan.",
    },
    {
      role: "user",
      content: JSON.stringify({ input, arcs }),
    },
  ];
}
