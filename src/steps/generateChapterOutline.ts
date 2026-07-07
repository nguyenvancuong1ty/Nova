import { join } from "node:path";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ChapterPlanEntry } from "../types";
import { getChapterDir } from "./helpers";

export async function generateChapterOutline(
  outputPath: string,
  chapterPlan: ChapterPlanEntry,
  fileStore: FileStore = createFileStore(),
): Promise<string> {
  const relativePath = `chapters/chapter-${String(chapterPlan.chapterNumber).padStart(4, "0")}/outline.md`;
  const content = `# ${chapterPlan.title}

## Chapter Goal
${chapterPlan.mainGoal}

## Opening Hook
Open at ${chapterPlan.requiredLocations[0]} under immediate pressure.

## Required Characters
${chapterPlan.requiredCharacters.join(", ")}

## Required Locations
${chapterPlan.requiredLocations.join(", ")}

## Key Events
- Establish the current danger.
- Push the chapter conflict into motion.
- End on a concrete hook.

## Main Conflict
${chapterPlan.mainConflict}

## Emotional Beat
${chapterPlan.emotionalBeat}

## Ending Hook
${chapterPlan.endingHook}

## Video Adaptation Notes
${chapterPlan.videoFocus}
`;
  await fileStore.writeText(
    join(getChapterDir(outputPath, chapterPlan.chapterNumber), "outline.md"),
    content,
  );
  return relativePath;
}
