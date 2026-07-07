import { join } from "node:path";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ProductionInput } from "../types";

export async function saveOriginalInput(
  outputPath: string,
  input: ProductionInput,
  fileStore: FileStore = createFileStore(),
): Promise<string> {
  const relativePath = "input/production-input.json";
  await fileStore.writeJson(join(outputPath, relativePath), input);
  return relativePath;
}
