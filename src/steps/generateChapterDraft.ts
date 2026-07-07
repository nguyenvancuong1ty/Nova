import { join } from "node:path";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ChapterPlanEntry, ProductionInput } from "../types";
import {
  buildSceneSummary,
  buildSceneTitle,
  getChapterDir,
  getChapterSceneCount,
} from "./helpers";

export async function generateChapterDraft(
  outputPath: string,
  input: ProductionInput,
  chapterPlan: ChapterPlanEntry,
  fileStore: FileStore = createFileStore(),
): Promise<string> {
  const sceneCount = getChapterSceneCount(input, chapterPlan.chapterNumber);
  const scenes = Array.from({ length: sceneCount }, (_, index) => {
    const sceneNumber = index + 1;
    return `## Scene ${String(sceneNumber).padStart(2, "0")} - ${buildSceneTitle(chapterPlan, sceneNumber)}

${buildSceneSummary(chapterPlan, chapterPlan.chapterNumber, sceneNumber)}

Placeholder prose keeps the pacing deterministic while preserving enough structure for storyboard, prompt, and subtitle generation.`;
  }).join("\n\n");

  const content = `# Chapter ${String(chapterPlan.chapterNumber).padStart(4, "0")} - ${chapterPlan.title}

${scenes}
`;

  await fileStore.writeText(
    join(
      getChapterDir(outputPath, chapterPlan.chapterNumber),
      "chapter-draft.md",
    ),
    content,
  );
  return `chapters/chapter-${String(chapterPlan.chapterNumber).padStart(4, "0")}/chapter-draft.md`;
}
