import { join } from "node:path";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ProductionInput } from "../types";

export async function generateCharacterBible(
  outputPath: string,
  input: ProductionInput,
  fileStore: FileStore = createFileStore(),
): Promise<string[]> {
  const relativePaths: string[] = ["knowledge-base/character-bible.md"];
  const sections = input.characters.map((character) => {
    const characterPath = `knowledge-base/characters/${character.id}.json`;
    relativePaths.push(characterPath);
    return `## ${character.name}

- Role: ${character.role}
- Appearance: ${character.visualDescription}
- Personality: ${character.personality.join(", ") || "Reserved"}
- Motivation: ${character.motivation ?? "Not specified"}
- Fear: ${character.fear ?? "Not specified"}
- Secret: ${character.secret ?? "Not specified"}
- Voice: ${character.voice ?? "Not specified"}
- Relationships: ${character.relationships.map((item) => `${item.characterId} (${item.relation})`).join(", ") || "None"}
- Character Arc Direction: ${character.name} is pushed toward a decisive confrontation with the story's core conflict.
- Visual Consistency Rules: Preserve the core visual description and role silhouette in every scene.`;
  });

  await fileStore.writeText(
    join(outputPath, relativePaths[0]),
    `# Character Bible\n\n${sections.join("\n\n")}\n`,
  );

  await Promise.all(
    input.characters.map((character) =>
      fileStore.writeJson(
        join(outputPath, "knowledge-base/characters", `${character.id}.json`),
        character,
      ),
    ),
  );

  return relativePaths;
}
