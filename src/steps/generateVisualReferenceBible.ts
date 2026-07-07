import { join } from "node:path";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ProductionInput } from "../types";

export async function generateVisualReferenceBible(
  outputPath: string,
  input: ProductionInput,
  fileStore: FileStore = createFileStore(),
): Promise<string> {
  const relativePath = "knowledge-base/visual-reference-bible.md";
  const body = input.characters
    .map(
      (character) => `## Character: ${character.name}

Reference ID: character:${character.id}

Stable Visual Identity:
${character.visualDescription}

Must Not Change:
- Preserve the primary facial and silhouette cues from the visual description.
- Keep the character role readable as ${character.role}.

Prompt Fragment:
Use character reference character:${character.id}. Maintain ${character.visualDescription}.`,
    )
    .join("\n\n");

  await fileStore.writeText(
    join(outputPath, relativePath),
    `# Visual Reference Bible\n\n${body}\n`,
  );
  return relativePath;
}
