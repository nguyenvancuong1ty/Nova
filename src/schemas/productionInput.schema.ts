import { z } from "zod";
import { CharacterInputSchema } from "./character.schema";
import {
  ChapterConfigSchema,
  ProjectConfigSchema,
  StoryInputSchema,
  VideoConfigSchema,
  WorldInputSchema,
} from "./project.schema";

export const ProductionInputSchema = z.object({
  project: ProjectConfigSchema,
  story: StoryInputSchema,
  world: WorldInputSchema,
  characters: z.array(CharacterInputSchema).min(1),
  video: VideoConfigSchema,
  chapterConfig: ChapterConfigSchema,
});
