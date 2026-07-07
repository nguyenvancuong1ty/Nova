import { join } from "node:path";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ChapterPlanEntry, Scene } from "../types";

interface TimelineEntry {
  chapterNumber: number;
  majorEvents: string[];
  characterStateChanges: string[];
  relationshipChanges: string[];
  newCanonFacts: string[];
  unresolvedMysteries: string[];
  currentLocations: string[];
}

export async function updateTimeline(
  outputPath: string,
  chapterPlan: ChapterPlanEntry,
  scenes: Scene[],
  fileStore: FileStore = createFileStore(),
): Promise<string> {
  const relativePath = "knowledge-base/timeline/timeline-master.json";
  const fullPath = join(outputPath, relativePath);
  const existing = (await fileStore.exists(fullPath))
    ? await fileStore.readJson<TimelineEntry[]>(fullPath)
    : [];

  existing.push({
    chapterNumber: chapterPlan.chapterNumber,
    majorEvents: scenes.map((scene) => scene.summary),
    characterStateChanges: chapterPlan.requiredCharacters.map(
      (characterId) =>
        `${characterId} absorbs the pressure of ${chapterPlan.mainConflict.toLowerCase()}.`,
    ),
    relationshipChanges: [
      `Trust shifts under ${chapterPlan.mainConflict.toLowerCase()}.`,
    ],
    newCanonFacts: [chapterPlan.mysteryProgress],
    unresolvedMysteries: [chapterPlan.endingHook],
    currentLocations: [...new Set(scenes.map((scene) => scene.location))],
  });

  await fileStore.writeJson(fullPath, existing);
  return relativePath;
}
