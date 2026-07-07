import { join } from "node:path";
import type { ChapterPlanEntry, ProductionInput, Scene } from "../types";

export function formatChapterNumber(chapterNumber: number): string {
  return String(chapterNumber).padStart(4, "0");
}

export function getChapterDir(
  outputPath: string,
  chapterNumber: number,
): string {
  return join(
    outputPath,
    "chapters",
    `chapter-${formatChapterNumber(chapterNumber)}`,
  );
}

export function getPrimaryCharacters(input: ProductionInput): string[] {
  return input.characters.map((character) => character.id);
}

export function getChapterSceneCount(
  input: ProductionInput,
  chapterNumber: number,
): number {
  const min = input.chapterConfig.scenesPerChapter.min;
  const max = input.chapterConfig.scenesPerChapter.max;
  const spread = Math.max(max - min, 0);
  return Math.min(
    max,
    min + (spread === 0 ? 0 : (chapterNumber - 1) % (spread + 1)),
  );
}

export function pickLocation(input: ProductionInput, index: number): string {
  return input.world.importantLocations[
    index % input.world.importantLocations.length
  ];
}

export function buildSceneTitle(
  plan: ChapterPlanEntry,
  sceneNumber: number,
): string {
  return `${plan.title} Scene ${String(sceneNumber).padStart(2, "0")}`;
}

export function buildSceneSummary(
  plan: ChapterPlanEntry,
  chapterNumber: number,
  sceneNumber: number,
): string {
  return `Chapter ${chapterNumber} scene ${sceneNumber} advances ${plan.mainGoal.toLowerCase()} while pressure rises around ${plan.mainConflict.toLowerCase()}.`;
}

export function getSceneCharacterIds(
  plan: ChapterPlanEntry,
  allCharacterIds: string[],
  sceneNumber: number,
): string[] {
  const base =
    plan.requiredCharacters.length > 0
      ? plan.requiredCharacters
      : allCharacterIds;
  const first = base[sceneNumber % base.length] ?? allCharacterIds[0];
  const second = base[(sceneNumber + 1) % base.length];
  return second && second !== first ? [first, second] : [first];
}

export function renderSceneBlock(scene: Scene): string {
  return [
    `## Scene ${String(scene.sceneNumber).padStart(2, "0")} - ${scene.title}`,
    "",
    `${scene.summary}`,
    `${scene.purpose}. Visual focus: ${scene.visualFocus}. Emotional beat: ${scene.emotionalBeat}.`,
    "",
  ].join("\n");
}
