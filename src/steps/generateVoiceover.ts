import { join } from "node:path";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { Scene } from "../types";
import { getChapterDir } from "./helpers";

export async function generateVoiceover(
  outputPath: string,
  chapterNumber: number,
  scenes: Scene[],
  fileStore: FileStore = createFileStore(),
): Promise<string> {
  const content = `# Voiceover - Chapter ${String(chapterNumber).padStart(4, "0")}

${scenes
  .map(
    (scene) => `## Scene ${String(scene.sceneNumber).padStart(2, "0")}

${scene.summary}`,
  )
  .join("\n\n")}
`;

  await fileStore.writeText(
    join(getChapterDir(outputPath, chapterNumber), "voiceover.md"),
    content,
  );
  return `chapters/chapter-${String(chapterNumber).padStart(4, "0")}/voiceover.md`;
}
