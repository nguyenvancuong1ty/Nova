import { z } from "zod";

export const ImagePromptSchema = z.object({
  id: z.string().min(1),
  chapterNumber: z.number().int().min(1),
  sceneNumber: z.number().int().min(1),
  prompt: z.string().min(1),
  negativePrompt: z.string().optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]),
  style: z.string().min(1),
  characterReferences: z.array(z.string().min(1)),
  characterConsistencyNotes: z.array(z.string().min(1)),
});
