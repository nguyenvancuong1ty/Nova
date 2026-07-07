import { join } from "node:path";
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
): Promise<string> {
  const content =
    report.status === "PASS"
      ? `${draftContent}\n\n## Revision Notes\nNo major issues detected. Draft copied to final.`
      : `${draftContent}\n\n## Revision Notes\n${report.issues.map((issue) => `- ${issue}`).join("\n")}`;
  await fileStore.writeText(
    join(getChapterDir(outputPath, chapterNumber), "chapter-final.md"),
    content,
  );
  return `chapters/chapter-${String(chapterNumber).padStart(4, "0")}/chapter-final.md`;
}
