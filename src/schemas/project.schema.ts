import { z } from "zod";

export const ProjectConfigSchema = z.object({
  title: z.string().min(1),
  creatorName: z.string().optional(),
  language: z.string().default("Vietnamese"),
  format: z.enum(["webnovel", "light-novel", "serial-fiction"]),
  genres: z.array(z.string().min(1)).min(1),
  tone: z.string().min(1),
  targetAudience: z.string().optional(),
});

export const StoryInputSchema = z.object({
  mainPremise: z.string().min(1),
  mainConflict: z.string().min(1),
  endingDirection: z.string().min(1),
  openingSituation: z.string().min(1),
  mainMystery: z.string().min(1),
  romanceAngle: z.string().min(1),
  powerSystemNotes: z.string().min(1),
  importantThemes: z.array(z.string().min(1)).min(1),
});

export const WorldInputSchema = z.object({
  worldSetting: z.string().min(1),
  worldRules: z.string().min(1),
  magicSystem: z.string().min(1),
  importantLocations: z.array(z.string().min(1)).min(1),
  importantOrganizations: z.array(z.string().min(1)).min(1),
  technologyLevel: z.string().min(1),
  socialStructure: z.string().min(1),
});

export const VideoConfigSchema = z.object({
  videoFormat: z.string().min(1),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]),
  visualStyle: z.string().min(1),
  cameraStyle: z.string().min(1),
  imageStyleNotes: z.string().min(1),
  videoMotionStyle: z.string().min(1),
  voiceoverStyle: z.string().min(1),
  subtitleStyle: z.string().min(1),
});

export const ChapterConfigSchema = z
  .object({
    totalChapters: z.number().int().min(1).max(300),
    targetWordsPerChapter: z.object({
      min: z.number().int().min(500),
      max: z.number().int().min(500),
    }),
    scenesPerChapter: z.object({
      min: z.number().int().min(3),
      max: z.number().int().min(3),
    }),
  })
  .superRefine((value, ctx) => {
    if (value.targetWordsPerChapter.min > value.targetWordsPerChapter.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "targetWordsPerChapter min must be less than or equal to max",
        path: ["targetWordsPerChapter", "min"],
      });
    }

    if (value.scenesPerChapter.min > value.scenesPerChapter.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "scenesPerChapter min must be less than or equal to max",
        path: ["scenesPerChapter", "min"],
      });
    }
  });
