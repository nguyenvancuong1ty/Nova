import { join } from "node:path";
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
): Promise<VideoPrompt[]> {
  const prompts = scenes.map((scene, index) =>
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

  await fileStore.writeJson(
    join(getChapterDir(outputPath, chapterNumber), "video-prompts.json"),
    prompts,
  );
  return prompts;
}
