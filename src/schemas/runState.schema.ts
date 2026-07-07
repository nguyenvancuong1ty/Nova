import { z } from "zod";

export const RunStateSchema = z.object({
  runId: z.string().min(1),
  projectSlug: z.string().min(1),
  status: z.enum(["idle", "running", "completed", "failed", "cancelled"]),
  currentStep: z.string().optional(),
  currentChapter: z.number().int().min(1).optional(),
  totalChapters: z.number().int().min(1),
  progressPercent: z.number().min(0).max(100),
  startedAt: z.string().min(1),
  finishedAt: z.string().optional(),
  outputPath: z.string().min(1),
  error: z.string().optional(),
  logs: z.array(z.string()).default([]),
});
