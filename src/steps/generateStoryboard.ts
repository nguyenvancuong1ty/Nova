import { join } from "node:path";
import type { GenerationService } from "../llm/generationService";
import { buildStoryboardPrompt } from "../llm/promptTemplates/scenePrompts";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { Scene } from "../types";
import { getChapterDir } from "./helpers";

const CAMERA_DIRECTIONS = [
  "Wide establishing shot",
  "Slow push-in",
  "Close-up on character expression",
  "Over-the-shoulder shot",
  "Low-angle dramatic shot",
];

export async function generateStoryboard(
  outputPath: string,
  chapterNumber: number,
  scenes: Scene[],
  fileStore: FileStore = createFileStore(),
  generationService?: GenerationService,
): Promise<string> {
  const fallbackContent = `# Storyboard - Chapter ${String(chapterNumber).padStart(4, "0")}

${scenes
  .map(
    (
      scene,
      index,
    ) => `## Scene ${String(scene.sceneNumber).padStart(2, "0")} - ${scene.title}

Location: ${scene.location}
Characters: ${scene.characters.join(", ")}
Visual Focus: ${scene.visualFocus}
Camera Direction: ${CAMERA_DIRECTIONS[index % CAMERA_DIRECTIONS.length]}
Emotional Beat: ${scene.emotionalBeat}
Video Potential: ${scene.videoPotential}
Sound Mood: Atmospheric tension with ${scene.emotionalBeat.toLowerCase()} undertones.`,
  )
  .join("\n\n")}
`;
  const content = generationService
    ? (
        await generationService.generateMarkdown({
          step: "generate_storyboard",
          messages: buildStoryboardPrompt(chapterNumber, scenes),
        })
      ).content
    : fallbackContent;
  await fileStore.writeText(
    join(getChapterDir(outputPath, chapterNumber), "storyboard.md"),
    content,
  );
  return `chapters/chapter-${String(chapterNumber).padStart(4, "0")}/storyboard.md`;
}
