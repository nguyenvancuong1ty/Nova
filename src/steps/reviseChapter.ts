import { join } from "node:path";
import type { GenerationService } from "../llm/generationService";
import { buildRevisionPrompt } from "../llm/promptTemplates/longformPrompts";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ContinuityReport } from "../types";
import { getChapterDir } from "./helpers";

export async function reviseChapter(
  outputPath: string,
  chapterNumber: number,
  draftContent: string,
  report: ContinuityReport,
  fileStore: FileStore = createFileStore(),
  generationService?: GenerationService,
): Promise<string> {
  const fallbackContent =
    report.status === "PASS"
      ? `${draftContent}\n\n## Revision Notes\nNo major issues detected. Draft copied to final.`
      : `${draftContent}\n\n## Revision Notes\n${report.issues.map((issue) => `- ${issue}`).join("\n")}`;
  const content = generationService
    ? (
        await generationService.generateMarkdown({
          step: "revise_chapter",
          messages: buildRevisionPrompt(draftContent, report),
        })
      ).content
    : fallbackContent;
  await fileStore.writeText(
    join(getChapterDir(outputPath, chapterNumber), "chapter-final.md"),
    content,
  );
  return `chapters/chapter-${String(chapterNumber).padStart(4, "0")}/chapter-final.md`;
}
