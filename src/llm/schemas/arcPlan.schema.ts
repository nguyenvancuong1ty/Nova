import { z } from "zod";

export const LlmArcPlanSchema = z.array(
  z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    startChapter: z.number().int().min(1),
    endChapter: z.number().int().min(1),
    premise: z.string().min(1),
    mainConflict: z.string().min(1),
    keyReveals: z.array(z.string().min(1)),
    emotionalProgression: z.string().min(1),
    expectedEnding: z.string().min(1),
  }),
);
