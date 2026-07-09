import { join } from "node:path";
import { z } from "zod";
import type { GenerationService } from "../llm/generationService";
import { buildImagePromptPrompt } from "../llm/promptTemplates/adaptationPrompts";
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
  generationService?: GenerationService,
): Promise<ImagePrompt[]> {
  const fallbackPrompts = scenes.map((scene) =>
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
  const prompts = generationService
    ? (
        await generationService.generateStructured({
          step: "generate_image_prompts",
          schema: z.array(ImagePromptSchema),
          messages: buildImagePromptPrompt(input, chapterNumber, scenes),
        })
      ).data.map((prompt) => ImagePromptSchema.parse(prompt))
    : fallbackPrompts;

  await fileStore.writeJson(
    join(getChapterDir(outputPath, chapterNumber), "image-prompts.json"),
    prompts,
  );
  return prompts;
}
