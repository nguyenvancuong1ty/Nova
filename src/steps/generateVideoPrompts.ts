import { join } from "node:path";
import { z } from "zod";
import type { GenerationService } from "../llm/generationService";
import { buildVideoPromptPrompt } from "../llm/promptTemplates/adaptationPrompts";
import { VideoPromptSchema } from "../schemas/videoPrompt.schema";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ProductionInput, Scene, VideoPrompt } from "../types";
import { getChapterDir } from "./helpers";

const CAMERA_MOVEMENTS = [
  "slow push-in",
  "steady lateral drift",
  "subtle handheld hold",
  "slow tilt down",
];

export async function generateVideoPrompts(
  outputPath: string,
  input: ProductionInput,
  chapterNumber: number,
  scenes: Scene[],
  fileStore: FileStore = createFileStore(),
  generationService?: GenerationService,
): Promise<VideoPrompt[]> {
  const fallbackPrompts = scenes.map((scene, index) =>
    VideoPromptSchema.parse({
      id: `video-ch${String(chapterNumber).padStart(4, "0")}-sc${String(scene.sceneNumber).padStart(3, "0")}`,
      chapterNumber,
      sceneNumber: scene.sceneNumber,
      prompt: `Start from the generated image for scene ${scene.sceneNumber}. Use ${CAMERA_MOVEMENTS[index % CAMERA_MOVEMENTS.length]} to emphasize ${scene.visualFocus.toLowerCase()}. Keep the atmosphere aligned with ${input.video.videoMotionStyle}.`,
      cameraMovement: CAMERA_MOVEMENTS[index % CAMERA_MOVEMENTS.length],
      durationSeconds: 6,
      motionNotes: `Subtle motion around ${scene.location} with restrained character movement.`,
      soundDesignNotes: `Low ambient tone supporting ${scene.emotionalBeat.toLowerCase()}.`,
    }),
  );
  const prompts = generationService
    ? (
        await generationService.generateStructured({
          step: "generate_video_prompts",
          schema: z.array(VideoPromptSchema),
          messages: buildVideoPromptPrompt(input, chapterNumber, scenes),
        })
      ).data.map((prompt) => VideoPromptSchema.parse(prompt))
    : fallbackPrompts;

  await fileStore.writeJson(
    join(getChapterDir(outputPath, chapterNumber), "video-prompts.json"),
    prompts,
  );
  return prompts;
}
