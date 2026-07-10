import { resolveTierForStep } from "./modelTiers";
import type { LlmStepId, OutputMode } from "./types";

export interface GenerationConfig {
  step: LlmStepId;
  tier: ReturnType<typeof resolveTierForStep>;
  outputMode: OutputMode;
  temperature: number;
  maxTokens: number;
  repairAttempts: number;
}

const structuredSteps = new Set<LlmStepId>([
  "generate_arc_plan",
  "generate_chapter_plan",
  "split_chapter_into_scenes",
  "generate_image_prompts",
  "generate_video_prompts",
  "generate_subtitles",
]);

export function getGenerationConfig(step: LlmStepId): GenerationConfig {
  return {
    step,
    tier: resolveTierForStep(step),
    outputMode: structuredSteps.has(step) ? "json" : "markdown",
    temperature: step === "generate_chapter_draft" ? 0.9 : 0.4,
    maxTokens: 20_000,
    repairAttempts: structuredSteps.has(step) ? 2 : 0,
  };
}
