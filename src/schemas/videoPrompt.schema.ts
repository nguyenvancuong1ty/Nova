import { z } from "zod";

export const VideoPromptSchema = z.object({
  id: z.string().min(1),
  chapterNumber: z.number().int().min(1),
  sceneNumber: z.number().int().min(1),
  prompt: z.string().min(1),
  cameraMovement: z.string().min(1),
  durationSeconds: z.number().int().min(1),
  motionNotes: z.string().min(1),
  soundDesignNotes: z.string().optional(),
});
