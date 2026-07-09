import { join } from "node:path";
import type { GenerationService } from "../llm/generationService";
import { buildSubtitlePrompt } from "../llm/promptTemplates/utilityPrompts";
import { LlmSubtitleSchema } from "../llm/schemas/subtitle.schema";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { Scene } from "../types";
import { getChapterDir } from "./helpers";

function formatTimestamp(totalSeconds: number): string {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0",
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds},000`;
}

export async function generateSubtitles(
  outputPath: string,
  chapterNumber: number,
  scenes: Scene[],
  fileStore: FileStore = createFileStore(),
  generationService?: GenerationService,
): Promise<string> {
  const fallbackContent = scenes
    .map((scene, index) => {
      const start = index * 6;
      const end = start + 6;
      return `${index + 1}
${formatTimestamp(start)} --> ${formatTimestamp(end)}
${scene.summary}`;
    })
    .join("\n\n");
  const content = generationService
    ? (
        await generationService.generateStructured({
          step: "generate_subtitles",
          schema: LlmSubtitleSchema,
          messages: buildSubtitlePrompt(chapterNumber, scenes),
        })
      ).data
        .map(
          (segment) => `${segment.index}
${formatTimestamp(segment.startSeconds)} --> ${formatTimestamp(segment.endSeconds)}
${segment.text}`,
        )
        .join("\n\n")
    : fallbackContent;

  await fileStore.writeText(
    join(getChapterDir(outputPath, chapterNumber), "subtitles.srt"),
    content,
  );
  return `chapters/chapter-${String(chapterNumber).padStart(4, "0")}/subtitles.srt`;
}
