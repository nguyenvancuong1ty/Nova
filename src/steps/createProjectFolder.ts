import { join } from "node:path";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import { createUniqueProjectSlug } from "../services/slugService";

const REQUIRED_DIRS = [
  "input",
  "knowledge-base",
  "knowledge-base/characters",
  "knowledge-base/locations",
  "knowledge-base/organizations",
  "knowledge-base/items",
  "knowledge-base/timeline",
  "planning",
  "chapters",
  "exports",
  "logs",
];

export async function createProjectFolder(
  title: string,
  outputsDir: string,
  fileStore: FileStore = createFileStore(),
): Promise<{ projectSlug: string; outputPath: string }> {
  await fileStore.ensureDir(outputsDir);
  const projectSlug = await createUniqueProjectSlug(title, outputsDir);
  const outputPath = join(outputsDir, projectSlug);

  await Promise.all(
    REQUIRED_DIRS.map((dir) => fileStore.ensureDir(join(outputPath, dir))),
  );

  return { projectSlug, outputPath };
}
