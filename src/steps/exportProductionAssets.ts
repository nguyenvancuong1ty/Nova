import { join } from "node:path";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ImagePrompt, Scene, VideoPrompt } from "../types";
import { getChapterDir } from "./helpers";

export async function exportProductionAssets(
  outputPath: string,
  totalChapters: number,
  fileStore: FileStore = createFileStore(),
): Promise<string[]> {
  const allScenes: Scene[] = [];
  const allImagePrompts: ImagePrompt[] = [];
  const allVideoPrompts: VideoPrompt[] = [];
  const storyboards: string[] = [];
  const voiceovers: string[] = [];
  const subtitles: string[] = [];

  for (let index = 0; index < totalChapters; index += 1) {
    const chapterNumber = index + 1;
    const chapterDir = getChapterDir(outputPath, chapterNumber);
    allScenes.push(
      ...(await fileStore.readJson<Scene[]>(join(chapterDir, "scenes.json"))),
    );
    allImagePrompts.push(
      ...(await fileStore.readJson<ImagePrompt[]>(
        join(chapterDir, "image-prompts.json"),
      )),
    );
    allVideoPrompts.push(
      ...(await fileStore.readJson<VideoPrompt[]>(
        join(chapterDir, "video-prompts.json"),
      )),
    );
    storyboards.push(
      await fileStore.readText(join(chapterDir, "storyboard.md")),
    );
    voiceovers.push(await fileStore.readText(join(chapterDir, "voiceover.md")));
    subtitles.push(await fileStore.readText(join(chapterDir, "subtitles.srt")));
  }

  const outputs: Array<[string, string | object]> = [
    ["exports/all-scenes.json", allScenes],
    ["exports/all-storyboards.md", storyboards.join("\n\n")],
    ["exports/all-image-prompts.json", allImagePrompts],
    ["exports/all-video-prompts.json", allVideoPrompts],
    ["exports/all-voiceovers.md", voiceovers.join("\n\n")],
    ["exports/all-subtitles.srt", subtitles.join("\n\n")],
  ];

  await Promise.all(
    outputs.map(([relativePath, content]) =>
      typeof content === "string"
        ? fileStore.writeText(join(outputPath, relativePath), content)
        : fileStore.writeJson(join(outputPath, relativePath), content),
    ),
  );

  return outputs.map(([relativePath]) => relativePath);
}
