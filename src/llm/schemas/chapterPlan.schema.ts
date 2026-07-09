import { z } from "zod";

export const LlmChapterPlanSchema = z.array(
  z.object({
    chapterNumber: z.number().int().min(1),
    title: z.string().min(1),
    arcId: z.string().min(1),
    mainGoal: z.string().min(1),
    mainConflict: z.string().min(1),
    requiredCharacters: z.array(z.string().min(1)),
    requiredLocations: z.array(z.string().min(1)),
    emotionalBeat: z.string().min(1),
    mysteryProgress: z.string().min(1),
    romanceProgress: z.string().min(1),
    endingHook: z.string().min(1),
    videoFocus: z.string().min(1),
  }),
);
