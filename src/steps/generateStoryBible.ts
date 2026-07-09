import { join } from "node:path";
import { buildStoryBiblePrompt } from "../llm/promptTemplates/planningPrompts";
import type { GenerationService } from "../llm/generationService";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ProductionInput } from "../types";

export async function generateStoryBible(
  outputPath: string,
  input: ProductionInput,
  fileStore: FileStore = createFileStore(),
  generationService?: GenerationService,
): Promise<string> {
  const relativePath = "knowledge-base/story-bible.md";
  const fallbackContent = `# Story Bible

## Title
${input.project.title}

## Format
${input.project.format}

## Genres
${input.project.genres.join(", ")}

## Tone
${input.project.tone}

## Target Audience
${input.project.targetAudience ?? "General audience"}

## Main Premise
${input.story.mainPremise}

## Main Conflict
${input.story.mainConflict}

## Main Mystery
${input.story.mainMystery}

## Romance Angle
${input.story.romanceAngle}

## Ending Direction
${input.story.endingDirection}

## Core Themes
${input.story.importantThemes.join(", ")}

## Long-term Story Promise
The series steadily expands the consequences of ${input.story.mainPremise.toLowerCase()} while paying off ${input.story.mainMystery.toLowerCase()}.
`;
  const content = generationService
    ? (
        await generationService.generateMarkdown({
          step: "generate_story_bible",
          messages: buildStoryBiblePrompt(input),
        })
      ).content
    : fallbackContent;
  await fileStore.writeText(join(outputPath, relativePath), content);
  return relativePath;
}
