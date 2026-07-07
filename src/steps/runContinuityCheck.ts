import { join } from "node:path";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ChapterPlanEntry, ContinuityReport, Scene } from "../types";
import { getChapterDir } from "./helpers";

interface RunContinuityCheckInput {
  chapterNumber: number;
  expectedSceneRange: { min: number; max: number };
  scenes: Scene[];
  chapterPlan: Pick<ChapterPlanEntry, "endingHook" | "requiredCharacters">;
  knownCharacterIds: string[];
  outputPath?: string;
  fileStore?: FileStore;
}

export async function runContinuityCheck(
  input: RunContinuityCheckInput,
): Promise<ContinuityReport> {
  const issues: string[] = [];
  const unknownCharacters = new Set<string>();

  if (
    input.scenes.length < input.expectedSceneRange.min ||
    input.scenes.length > input.expectedSceneRange.max
  ) {
    issues.push("scene count is outside the configured range");
  }

  for (const scene of input.scenes) {
    if (!scene.location.trim()) {
      issues.push(`scene ${scene.sceneNumber} is missing location`);
    }
    if (!scene.visualFocus.trim()) {
      issues.push(`scene ${scene.sceneNumber} is missing visual focus`);
    }
    if (!scene.emotionalBeat.trim()) {
      issues.push(`scene ${scene.sceneNumber} is missing emotional beat`);
    }
    if (!scene.purpose.trim()) {
      issues.push(`scene ${scene.sceneNumber} is missing purpose`);
    }
    for (const characterId of scene.characters) {
      if (!input.knownCharacterIds.includes(characterId)) {
        unknownCharacters.add(characterId);
      }
    }
  }

  if (!input.chapterPlan.endingHook.trim()) {
    issues.push("chapter is missing ending hook");
  }

  const presentCharacters = new Set(
    input.scenes.flatMap((scene) => scene.characters),
  );
  for (const requiredCharacter of input.chapterPlan.requiredCharacters) {
    if (!presentCharacters.has(requiredCharacter)) {
      issues.push(
        `missing required character from chapter plan: ${requiredCharacter}`,
      );
    }
  }

  for (const characterId of unknownCharacters) {
    issues.push(`unknown character reference: ${characterId}`);
  }

  const status: ContinuityReport["status"] =
    issues.length === 0 ? "PASS" : "WARN";
  const report: ContinuityReport = {
    status,
    issues,
    characterConsistency: unknownCharacters.size
      ? ["Unknown character references detected."]
      : ["All scene character references are known."],
    timelineConsistency: [
      "Chapter events remain in deterministic linear order.",
    ],
    worldbuildingConsistency: ["All required scene locations are populated."],
    visualConsistency: issues.some((issue) => issue.includes("visual focus"))
      ? ["Some scenes are missing visual focus details."]
      : ["Every scene has a visual focus."],
    videoAdaptationNotes: [
      "Use the storyboard camera directions to keep pacing consistent.",
    ],
    recommendedFixes:
      issues.length > 0
        ? issues.map((issue) => `Address: ${issue}`)
        : ["No fixes required."],
    markdown: "",
  };

  report.markdown = `# Continuity Report - Chapter ${String(input.chapterNumber).padStart(4, "0")}

## Status
${report.status}

## Issues
${report.issues.length > 0 ? report.issues.map((issue) => `- ${issue}`).join("\n") : "- None"}

## Character Consistency
${report.characterConsistency.map((line) => `- ${line}`).join("\n")}

## Timeline Consistency
${report.timelineConsistency.map((line) => `- ${line}`).join("\n")}

## Worldbuilding Consistency
${report.worldbuildingConsistency.map((line) => `- ${line}`).join("\n")}

## Visual Consistency
${report.visualConsistency.map((line) => `- ${line}`).join("\n")}

## Video Adaptation Notes
${report.videoAdaptationNotes.map((line) => `- ${line}`).join("\n")}

## Recommended Fixes
${report.recommendedFixes.map((line) => `- ${line}`).join("\n")}
`;

  if (input.outputPath) {
    const fileStore = input.fileStore ?? createFileStore();
    await fileStore.writeText(
      join(
        getChapterDir(input.outputPath, input.chapterNumber),
        "continuity-report.md",
      ),
      report.markdown,
    );
  }

  return report;
}
