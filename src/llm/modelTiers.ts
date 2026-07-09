import type { LlmStepId, LlmTier } from "./types";

export const LLM_STEP_IDS: readonly LlmStepId[] = [
  "generate_story_bible",
  "generate_world_bible",
  "generate_character_bible",
  "generate_arc_plan",
  "generate_chapter_plan",
  "generate_chapter_draft",
  "revise_chapter",
  "split_chapter_into_scenes",
  "generate_storyboard",
  "generate_image_prompts",
  "generate_video_prompts",
  "generate_voiceover",
  "generate_subtitles",
] as const;

const stepTierMap: Record<LlmStepId, LlmTier> = {
  generate_story_bible: "tier_planning",
  generate_world_bible: "tier_planning",
  generate_character_bible: "tier_planning",
  generate_arc_plan: "tier_planning",
  generate_chapter_plan: "tier_planning",
  generate_chapter_draft: "tier_longform",
  revise_chapter: "tier_longform",
  split_chapter_into_scenes: "tier_scene",
  generate_storyboard: "tier_scene",
  generate_image_prompts: "tier_adaptation",
  generate_video_prompts: "tier_adaptation",
  generate_voiceover: "tier_adaptation",
  generate_subtitles: "tier_utility",
};

export function resolveTierForStep(step: LlmStepId): LlmTier {
  return stepTierMap[step];
}
