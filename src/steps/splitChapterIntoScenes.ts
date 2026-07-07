import { join } from "node:path";
import { SceneSchema } from "../schemas/scene.schema";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ChapterPlanEntry, ProductionInput, Scene } from "../types";
import {
  buildSceneSummary,
  buildSceneTitle,
  getChapterDir,
  getChapterSceneCount,
  getPrimaryCharacters,
  getSceneCharacterIds,
} from "./helpers";

export async function splitChapterIntoScenes(
  outputPath: string,
  input: ProductionInput,
  chapterPlan: ChapterPlanEntry,
  fileStore: FileStore = createFileStore(),
): Promise<Scene[]> {
  const allCharacterIds = getPrimaryCharacters(input);
  const sceneCount = getChapterSceneCount(input, chapterPlan.chapterNumber);
  const scenes: Scene[] = Array.from({ length: sceneCount }, (_, index) => {
    const sceneNumber = index + 1;
    return SceneSchema.parse({
      id: `scene-ch${String(chapterPlan.chapterNumber).padStart(4, "0")}-sc${String(sceneNumber).padStart(3, "0")}`,
      chapterNumber: chapterPlan.chapterNumber,
      sceneNumber,
      title: buildSceneTitle(chapterPlan, sceneNumber),
      location:
        chapterPlan.requiredLocations[
          index % chapterPlan.requiredLocations.length
        ],
      characters: getSceneCharacterIds(chapterPlan, allCharacterIds, index),
      purpose: `Move ${chapterPlan.mainGoal.toLowerCase()} forward.`,
      summary: buildSceneSummary(
        chapterPlan,
        chapterPlan.chapterNumber,
        sceneNumber,
      ),
      visualFocus: `Focus on ${chapterPlan.requiredLocations[0]} and the pressure of ${chapterPlan.mainConflict.toLowerCase()}.`,
      dialogueFocus: `Underline ${chapterPlan.mysteryProgress.toLowerCase()}`,
      emotionalBeat: chapterPlan.emotionalBeat,
      videoPotential: sceneNumber % 3 === 0 ? "high" : "medium",
    });
  });

  await fileStore.writeJson(
    join(getChapterDir(outputPath, chapterPlan.chapterNumber), "scenes.json"),
    scenes,
  );
  return scenes;
}
