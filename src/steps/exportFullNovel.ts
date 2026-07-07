import { join } from "node:path";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import { getChapterDir } from "./helpers";

export async function exportFullNovel(
  outputPath: string,
  totalChapters: number,
  fileStore: FileStore = createFileStore(),
): Promise<string> {
  const chapters = await Promise.all(
    Array.from({ length: totalChapters }, async (_, index) => {
      const chapterNumber = index + 1;
      return fileStore.readText(
        join(getChapterDir(outputPath, chapterNumber), "chapter-final.md"),
      );
    }),
  );

  const relativePath = "exports/full-novel.md";
  await fileStore.writeText(
    join(outputPath, relativePath),
    chapters.join("\n\n"),
  );
  return relativePath;
}
