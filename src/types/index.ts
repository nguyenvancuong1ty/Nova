import { z } from "zod";
import { CharacterInputSchema } from "../schemas/character.schema";
import { ImagePromptSchema } from "../schemas/imagePrompt.schema";
import { ProductionInputSchema } from "../schemas/productionInput.schema";
import {
  ChapterConfigSchema,
  ProjectConfigSchema,
  StoryInputSchema,
  VideoConfigSchema,
  WorldInputSchema,
} from "../schemas/project.schema";
import { RunStateSchema } from "../schemas/runState.schema";
import { SceneSchema } from "../schemas/scene.schema";
import { VideoPromptSchema } from "../schemas/videoPrompt.schema";

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
export type StoryInput = z.infer<typeof StoryInputSchema>;
export type WorldInput = z.infer<typeof WorldInputSchema>;
export type VideoConfig = z.infer<typeof VideoConfigSchema>;
export type ChapterConfig = z.infer<typeof ChapterConfigSchema>;
export type CharacterInput = z.infer<typeof CharacterInputSchema>;
export type ProductionInput = z.infer<typeof ProductionInputSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type ImagePrompt = z.infer<typeof ImagePromptSchema>;
export type VideoPrompt = z.infer<typeof VideoPromptSchema>;
export type RunState = z.infer<typeof RunStateSchema>;

export interface ArcPlanEntry {
  id: string;
  title: string;
  startChapter: number;
  endChapter: number;
  premise: string;
  mainConflict: string;
  keyReveals: string[];
  emotionalProgression: string;
  expectedEnding: string;
}

export interface ChapterPlanEntry {
  chapterNumber: number;
  title: string;
  arcId: string;
  mainGoal: string;
  mainConflict: string;
  requiredCharacters: string[];
  requiredLocations: string[];
  emotionalBeat: string;
  mysteryProgress: string;
  romanceProgress: string;
  endingHook: string;
  videoFocus: string;
}

export interface ContinuityReport {
  status: "PASS" | "WARN" | "FAIL";
  issues: string[];
  characterConsistency: string[];
  timelineConsistency: string[];
  worldbuildingConsistency: string[];
  visualConsistency: string[];
  videoAdaptationNotes: string[];
  recommendedFixes: string[];
  markdown: string;
}

export interface ProductionResult {
  runId: string;
  projectSlug: string;
  status: "completed" | "failed" | "cancelled";
  outputPath: string;
  generatedFiles: string[];
}
