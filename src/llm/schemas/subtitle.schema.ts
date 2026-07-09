import { z } from "zod";

export const LlmSubtitleSchema = z.array(
  z.object({
    index: z.number().int().min(1),
    startSeconds: z.number().int().min(0),
    endSeconds: z.number().int().min(1),
    text: z.string().min(1),
  }),
);
