import { join } from "node:path";
import type { GenerationService } from "../llm/generationService";
import { buildWorldBiblePrompt } from "../llm/promptTemplates/planningPrompts";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ProductionInput } from "../types";

export async function generateWorldBible(
  outputPath: string,
  input: ProductionInput,
  fileStore: FileStore = createFileStore(),
  generationService?: GenerationService,
): Promise<string> {
  const relativePath = "knowledge-base/world-bible.md";
  const fallbackContent = `# World Bible

## World Overview
${input.world.worldSetting}

## Power System
${input.world.magicSystem}

## World Rules
${input.world.worldRules}

## Social Structure
${input.world.socialStructure}

## Technology Level
${input.world.technologyLevel}

## Important Locations
${input.world.importantLocations.map((location) => `- ${location}`).join("\n")}

## Important Organizations
${input.world.importantOrganizations.map((organization) => `- ${organization}`).join("\n")}

## Visual Atmosphere
${input.video.visualStyle}

## Rules That Must Not Be Broken
- Respect the stated world rules.
- Keep the power system cost visible in every major escalation.
`;
  const content = generationService
    ? (
        await generationService.generateMarkdown({
          step: "generate_world_bible",
          messages: buildWorldBiblePrompt(input),
        })
      ).content
    : fallbackContent;
  await fileStore.writeText(join(outputPath, relativePath), content);
  return relativePath;
}
