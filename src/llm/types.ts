export type LlmTier =
  | "tier_planning"
  | "tier_longform"
  | "tier_scene"
  | "tier_adaptation"
  | "tier_utility";

export type OutputMode = "markdown" | "json";

export type LlmStepId =
  | "generate_story_bible"
  | "generate_world_bible"
  | "generate_character_bible"
  | "generate_arc_plan"
  | "generate_chapter_plan"
  | "generate_chapter_draft"
  | "revise_chapter"
  | "split_chapter_into_scenes"
  | "generate_storyboard"
  | "generate_image_prompts"
  | "generate_video_prompts"
  | "generate_voiceover"
  | "generate_subtitles";

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmGenerationResult<T> {
  data: T;
  raw: unknown;
}

export interface LlmMarkdownResult {
  content: string;
  raw: unknown;
}
