import { z } from "zod";

export const SceneSchema = z.object({
  id: z.string().min(1),
  chapterNumber: z.number().int().min(1),
  sceneNumber: z.number().int().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  characters: z.array(z.string().min(1)).min(1),
  purpose: z.string().min(1),
  summary: z.string().min(1),
  visualFocus: z.string().min(1),
  dialogueFocus: z.string().optional(),
  emotionalBeat: z.string().min(1),
  videoPotential: z.enum(["low", "medium", "high"]),
});
