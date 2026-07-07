import { ZodError } from "zod";
import { ProductionInputSchema } from "../schemas/productionInput.schema";
import type { ProductionInput } from "../types";

export function validateInput(input: unknown): ProductionInput {
  const parsed = ProductionInputSchema.parse(input);
  const errors: string[] = [];

  if (
    !parsed.characters.some((character) => character.role === "protagonist")
  ) {
    errors.push("At least one protagonist is required.");
  }

  if (
    parsed.chapterConfig.targetWordsPerChapter.min >
    parsed.chapterConfig.targetWordsPerChapter.max
  ) {
    errors.push("targetWordsPerChapter min must be less than or equal to max.");
  }

  if (
    parsed.chapterConfig.scenesPerChapter.min >
    parsed.chapterConfig.scenesPerChapter.max
  ) {
    errors.push("scenesPerChapter min must be less than or equal to max.");
  }

  if (!parsed.video.visualStyle.trim()) {
    errors.push("video.visualStyle is required.");
  }

  if (errors.length > 0) {
    throw new ZodError(
      errors.map((message) => ({
        code: "custom",
        path: [],
        message,
        input,
      })),
    );
  }

  return parsed;
}
