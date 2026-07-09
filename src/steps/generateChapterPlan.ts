import { join } from "node:path";
import type { GenerationService } from "../llm/generationService";
import { buildChapterPlanPrompt } from "../llm/promptTemplates/planningPrompts";
import { LlmChapterPlanSchema } from "../llm/schemas/chapterPlan.schema";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { ArcPlanEntry, ChapterPlanEntry, ProductionInput } from "../types";
import { pickLocation } from "./helpers";

export async function generateChapterPlan(
  outputPath: string,
  input: ProductionInput,
  arcs: ArcPlanEntry[],
  fileStore: FileStore = createFileStore(),
  generationService?: GenerationService,
): Promise<ChapterPlanEntry[]> {
  const fallbackChapterPlans: ChapterPlanEntry[] = Array.from(
    { length: input.chapterConfig.totalChapters },
    (_, index) => {
      const chapterNumber = index + 1;
      const arc =
        arcs.find(
          (item) =>
            chapterNumber >= item.startChapter &&
            chapterNumber <= item.endChapter,
        ) ?? arcs[0];
      const location = pickLocation(input, index);

      return {
        chapterNumber,
        title: `Chapter ${String(chapterNumber).padStart(4, "0")} - ${input.story.mainMystery}`,
        arcId: arc.id,
        mainGoal: `Advance the consequences of ${input.story.mainPremise.toLowerCase()}`,
        mainConflict: input.story.mainConflict,
        requiredCharacters: input.characters
          .slice(0, Math.min(2, input.characters.length))
          .map((item) => item.id),
        requiredLocations: [location],
        emotionalBeat:
          chapterNumber % 2 === 0
            ? "Resolve with rising dread"
            : "Escalate with uncertainty",
        mysteryProgress: `Chapter ${chapterNumber} reveals a controlled clue about ${input.story.mainMystery.toLowerCase()}.`,
        romanceProgress: `Chapter ${chapterNumber} nudges ${input.story.romanceAngle.toLowerCase()}.`,
        endingHook: `Chapter ${chapterNumber} ends with a sharper question about ${input.story.mainMystery.toLowerCase()}.`,
        videoFocus: `${input.video.cameraStyle}; emphasize ${location}.`,
      };
    },
  );
  const chapterPlans = generationService
    ? (
        await generationService.generateStructured({
          step: "generate_chapter_plan",
          schema: LlmChapterPlanSchema,
          messages: buildChapterPlanPrompt(input, arcs),
        })
      ).data
    : fallbackChapterPlans;

  const storyPlan = `# Full Story Plan

${chapterPlans
  .map(
    (plan) =>
      `## ${plan.title}\n- Arc: ${plan.arcId}\n- Goal: ${plan.mainGoal}\n- Hook: ${plan.endingHook}`,
  )
  .join("\n\n")}
`;

  await fileStore.writeJson(
    join(outputPath, "planning/chapter-plan.json"),
    chapterPlans,
  );
  await fileStore.writeText(
    join(outputPath, "planning/full-story-plan.md"),
    storyPlan,
  );
  return chapterPlans;
}
