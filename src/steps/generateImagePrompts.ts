import { join } from "node:path";
import { ImagePromptSchema } from "../schemas/imagePrompt.schema";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ImagePrompt, ProductionInput, Scene } from "../types";
import { getChapterDir } from "./helpers";

export async function generateImagePrompts(
  outputPath: string,
  input: ProductionInput,
  chapterNumber: number,
  scenes: Scene[],
  fileStore: FileStore = createFileStore(),
): Promise<ImagePrompt[]> {
  const prompts = scenes.map((scene) =>
    ImagePromptSchema.parse({
      id: `image-ch${String(chapterNumber).padStart(4, "0")}-sc${String(scene.sceneNumber).padStart(3, "0")}`,
      chapterNumber,
      sceneNumber: scene.sceneNumber,
      prompt: `Cinematic scene at ${scene.location}. ${scene.summary} Visual focus: ${scene.visualFocus}. Mood: ${scene.emotionalBeat}. Style: ${input.video.visualStyle}. Character references: ${scene.characters
        .map((id) => `character:${id}`)
        .join(", ")}.`,
      aspectRatio: input.video.aspectRatio,
      style: input.video.visualStyle,
      characterReferences: scene.characters.map((id) => `character:${id}`),
      characterConsistencyNotes: [
        "Do not change the stable visual identity of referenced characters.",
        "Follow knowledge-base/visual-reference-bible.md.",
      ],
    }),
  );

  await fileStore.writeJson(
    join(getChapterDir(outputPath, chapterNumber), "image-prompts.json"),
    prompts,
  );
  return prompts;
}
