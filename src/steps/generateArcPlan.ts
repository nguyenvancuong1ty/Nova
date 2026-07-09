import { join } from "node:path";
import type { GenerationService } from "../llm/generationService";
import { buildArcPlanPrompt } from "../llm/promptTemplates/planningPrompts";
import { LlmArcPlanSchema } from "../llm/schemas/arcPlan.schema";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ArcPlanEntry, ProductionInput } from "../types";

function getArcCount(totalChapters: number): number {
  if (totalChapters <= 10) return 1;
  if (totalChapters <= 30) return 3;
  if (totalChapters <= 60) return 5;
  if (totalChapters <= 100) return 7;
  return 10;
}

export async function generateArcPlan(
  outputPath: string,
  input: ProductionInput,
  fileStore: FileStore = createFileStore(),
  generationService?: GenerationService,
): Promise<ArcPlanEntry[]> {
  const arcCount = getArcCount(input.chapterConfig.totalChapters);
  const span = Math.ceil(input.chapterConfig.totalChapters / arcCount);
  const fallbackArcs: ArcPlanEntry[] = Array.from(
    { length: arcCount },
    (_, index) => {
      const startChapter = index * span + 1;
      const endChapter = Math.min(
        input.chapterConfig.totalChapters,
        startChapter + span - 1,
      );
      return {
        id: `arc-${String(index + 1).padStart(2, "0")}`,
        title: `Arc ${index + 1}: ${input.story.mainMystery}`,
        startChapter,
        endChapter,
        premise: `This arc escalates ${input.story.mainPremise.toLowerCase()}.`,
        mainConflict: input.story.mainConflict,
        keyReveals: [
          `Reveal ${index + 1} about ${input.story.mainMystery.toLowerCase()}`,
        ],
        emotionalProgression: `Chapters ${startChapter}-${endChapter} intensify ${input.project.tone.toLowerCase()} pressure.`,
        expectedEnding: `Arc ${index + 1} ends with a sharper cost tied to ${input.story.endingDirection.toLowerCase()}.`,
      };
    },
  );

  const arcs = generationService
    ? (
        await generationService.generateStructured({
          step: "generate_arc_plan",
          schema: LlmArcPlanSchema,
          messages: buildArcPlanPrompt(input),
        })
      ).data
    : fallbackArcs;

  await fileStore.writeJson(join(outputPath, "planning/arc-plan.json"), arcs);
  return arcs;
}
