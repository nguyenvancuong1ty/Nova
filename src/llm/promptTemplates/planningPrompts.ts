import type { ProductionInput } from "../../types";
import type { LlmMessage } from "../types";
import {
  buildMarkdownContract,
  buildStructuredArrayContract,
} from "./contracts";

export function buildStoryBiblePrompt(input: ProductionInput): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        `You are a senior novel planner. ${buildMarkdownContract({
          title: "# Story Bible",
          requiredSections: [
            "Title",
            "Format",
            "Genres",
            "Main Premise",
            "Main Conflict",
            "Main Mystery",
            "Ending Direction",
            "Core Themes",
          ],
        })}`,
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
        `You are a worldbuilding planner. ${buildMarkdownContract({
          title: "# World Bible",
          requiredSections: [
            "World Overview",
            "Power System",
            "World Rules",
            "Social Structure",
            "Technology Level",
            "Important Locations",
            "Important Organizations",
          ],
        })}`,
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
        `You are a character designer. ${buildMarkdownContract({
          title: "# Character Bible",
          requiredSections: [
            "Character Profiles",
            "Motivations",
            "Relationships",
            "Character Arcs",
            "Visual Consistency Rules",
          ],
        })}`,
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
        `You are a story architect. ${buildStructuredArrayContract({
          itemName: "arc",
          fields: [
            "id",
            "title",
            "startChapter",
            "endChapter",
            "premise",
            "mainConflict",
            "keyReveals",
            "emotionalProgression",
            "expectedEnding",
          ],
          cardinality: "an arc sequence that covers every chapter from 1 through the configured total without gaps or overlaps",
          constraints: [
            "startChapter and endChapter must be positive integers.",
            "keyReveals must be an array of non-empty strings.",
          ],
        })}`,
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
        `You are a serial novel planner. ${buildStructuredArrayContract({
          itemName: "chapter plan",
          fields: [
            "chapterNumber",
            "title",
            "arcId",
            "mainGoal",
            "mainConflict",
            "requiredCharacters",
            "requiredLocations",
            "emotionalBeat",
            "mysteryProgress",
            "romanceProgress",
            "endingHook",
            "videoFocus",
          ],
          cardinality: `exactly ${input.chapterConfig.totalChapters} items`,
          constraints: [
            `chapterNumber must cover every integer from 1 through ${input.chapterConfig.totalChapters} exactly once.`,
            "arcId must match an id from the supplied arc array.",
            "requiredCharacters and requiredLocations must be arrays of non-empty ids or names.",
          ],
        })}`,
    },
    {
      role: "user",
      content: JSON.stringify({ input, arcs }),
    },
  ];
}
