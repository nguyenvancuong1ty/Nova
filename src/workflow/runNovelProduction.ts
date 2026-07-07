import { join } from "node:path";
import { ZodError } from "zod";
import { createFileStore, type FileStore } from "../services/fileStore";
import { RunRegistry } from "../services/runRegistry";
import { createRunId } from "../utils/date";
import { generateArcPlan } from "../steps/generateArcPlan";
import { generateChapterDraft } from "../steps/generateChapterDraft";
import { generateChapterOutline } from "../steps/generateChapterOutline";
import { generateChapterPlan } from "../steps/generateChapterPlan";
import { generateCharacterBible } from "../steps/generateCharacterBible";
import { generateImagePrompts } from "../steps/generateImagePrompts";
import { createProjectFolder } from "../steps/createProjectFolder";
import { exportFullNovel } from "../steps/exportFullNovel";
import { exportProductionAssets } from "../steps/exportProductionAssets";
import { generateStoryboard } from "../steps/generateStoryboard";
import { generateStoryBible } from "../steps/generateStoryBible";
import { generateSubtitles } from "../steps/generateSubtitles";
import { generateVideoPrompts } from "../steps/generateVideoPrompts";
import { generateVisualReferenceBible } from "../steps/generateVisualReferenceBible";
import { generateVoiceover } from "../steps/generateVoiceover";
import { generateWorldBible } from "../steps/generateWorldBible";
import { reviseChapter } from "../steps/reviseChapter";
import { runContinuityCheck } from "../steps/runContinuityCheck";
import { saveOriginalInput } from "../steps/saveOriginalInput";
import { splitChapterIntoScenes } from "../steps/splitChapterIntoScenes";
import { updateTimeline } from "../steps/updateTimeline";
import { validateInput } from "../steps/validateInput";
import { writeFinalSummary } from "../steps/writeFinalSummary";
import type { ProductionInput, ProductionResult } from "../types";
import { createProgressTracker } from "./progressTracker";

interface RunNovelProductionOptions {
  outputsDir?: string;
  runId?: string;
  registry?: RunRegistry;
  fileStore?: FileStore;
}

export async function runNovelProduction(
  rawInput: ProductionInput,
  options: RunNovelProductionOptions = {},
): Promise<ProductionResult> {
  const fileStore = options.fileStore ?? createFileStore();
  const registry = options.registry ?? new RunRegistry();
  const outputsDir = options.outputsDir ?? join(process.cwd(), "outputs");
  const input = validateInput(rawInput);
  const runId = options.runId ?? createRunId();
  const { projectSlug, outputPath } = await createProjectFolder(
    input.project.title,
    outputsDir,
    fileStore,
  );
  const tracker = await createProgressTracker(
    {
      runId,
      projectSlug,
      totalChapters: input.chapterConfig.totalChapters,
      outputPath,
    },
    fileStore,
  );
  registry.set(tracker.getState());

  const generatedFiles: string[] = [];
  const warnings: string[] = [];

  async function recordStep(
    step: string,
    action: () => Promise<string | string[] | void>,
  ) {
    await tracker.setStep(step);
    registry.set(tracker.getState());
    const result = await action();
    registry.set(tracker.getState());
    if (typeof result === "string") {
      generatedFiles.push(result);
    } else if (Array.isArray(result)) {
      generatedFiles.push(...result);
    }
  }

  try {
    await recordStep("save_original_input", () =>
      saveOriginalInput(outputPath, input, fileStore),
    );
    await recordStep("generate_story_bible", () =>
      generateStoryBible(outputPath, input, fileStore),
    );
    await recordStep("generate_world_bible", () =>
      generateWorldBible(outputPath, input, fileStore),
    );
    await recordStep("generate_character_bible", () =>
      generateCharacterBible(outputPath, input, fileStore),
    );
    await recordStep("generate_visual_reference_bible", () =>
      generateVisualReferenceBible(outputPath, input, fileStore),
    );

    let arcs = [] as Awaited<ReturnType<typeof generateArcPlan>>;
    await recordStep("generate_arc_plan", async () => {
      arcs = await generateArcPlan(outputPath, input, fileStore);
      return "planning/arc-plan.json";
    });

    let chapterPlans = [] as Awaited<ReturnType<typeof generateChapterPlan>>;
    await recordStep("generate_chapter_plan", async () => {
      chapterPlans = await generateChapterPlan(
        outputPath,
        input,
        arcs,
        fileStore,
      );
      return ["planning/full-story-plan.md", "planning/chapter-plan.json"];
    });

    for (const chapterPlan of chapterPlans) {
      if (registry.isCancelled(runId)) {
        await tracker.log(
          `Workflow cancelled before chapter ${chapterPlan.chapterNumber}`,
        );
        await tracker.cancel();
        registry.set(tracker.getState());
        return {
          runId,
          projectSlug,
          status: "cancelled",
          outputPath,
          generatedFiles,
        };
      }

      await tracker.setChapter(chapterPlan.chapterNumber);
      registry.set(tracker.getState());

      await recordStep("generate_chapter_outline", () =>
        generateChapterOutline(outputPath, chapterPlan, fileStore),
      );
      await recordStep("generate_chapter_draft", () =>
        generateChapterDraft(outputPath, input, chapterPlan, fileStore),
      );

      let scenes = [] as Awaited<ReturnType<typeof splitChapterIntoScenes>>;
      await recordStep("split_chapter_into_scenes", async () => {
        scenes = await splitChapterIntoScenes(
          outputPath,
          input,
          chapterPlan,
          fileStore,
        );
        return `chapters/chapter-${String(chapterPlan.chapterNumber).padStart(4, "0")}/scenes.json`;
      });

      const continuityReport = await runContinuityCheck({
        chapterNumber: chapterPlan.chapterNumber,
        expectedSceneRange: input.chapterConfig.scenesPerChapter,
        scenes,
        chapterPlan,
        knownCharacterIds: input.characters.map((character) => character.id),
        outputPath,
        fileStore,
      });
      generatedFiles.push(
        `chapters/chapter-${String(chapterPlan.chapterNumber).padStart(4, "0")}/continuity-report.md`,
      );
      warnings.push(...continuityReport.issues);

      await recordStep("revise_chapter", async () => {
        const draftContent = await fileStore.readText(
          join(
            outputPath,
            `chapters/chapter-${String(chapterPlan.chapterNumber).padStart(4, "0")}/chapter-draft.md`,
          ),
        );
        return reviseChapter(
          outputPath,
          chapterPlan.chapterNumber,
          draftContent,
          continuityReport,
          fileStore,
        );
      });
      await recordStep("generate_storyboard", () =>
        generateStoryboard(
          outputPath,
          chapterPlan.chapterNumber,
          scenes,
          fileStore,
        ),
      );
      await recordStep("generate_image_prompts", async () => {
        await generateImagePrompts(
          outputPath,
          input,
          chapterPlan.chapterNumber,
          scenes,
          fileStore,
        );
        return `chapters/chapter-${String(chapterPlan.chapterNumber).padStart(4, "0")}/image-prompts.json`;
      });
      await recordStep("generate_video_prompts", async () => {
        await generateVideoPrompts(
          outputPath,
          input,
          chapterPlan.chapterNumber,
          scenes,
          fileStore,
        );
        return `chapters/chapter-${String(chapterPlan.chapterNumber).padStart(4, "0")}/video-prompts.json`;
      });
      await recordStep("generate_voiceover", () =>
        generateVoiceover(
          outputPath,
          chapterPlan.chapterNumber,
          scenes,
          fileStore,
        ),
      );
      await recordStep("generate_subtitles", () =>
        generateSubtitles(
          outputPath,
          chapterPlan.chapterNumber,
          scenes,
          fileStore,
        ),
      );
      await recordStep("update_timeline", () =>
        updateTimeline(outputPath, chapterPlan, scenes, fileStore),
      );
    }

    await recordStep("export_full_novel", () =>
      exportFullNovel(outputPath, input.chapterConfig.totalChapters, fileStore),
    );
    await recordStep("export_production_assets", () =>
      exportProductionAssets(
        outputPath,
        input.chapterConfig.totalChapters,
        fileStore,
      ),
    );

    const sceneTotal =
      chapterPlans.length *
      Math.max(input.chapterConfig.scenesPerChapter.min, 0);

    await recordStep("write_final_summary", () =>
      writeFinalSummary(
        {
          outputPath,
          projectTitle: input.project.title,
          totalChapters: input.chapterConfig.totalChapters,
          totalScenes: sceneTotal,
          warnings,
        },
        fileStore,
      ),
    );

    await tracker.complete();
    registry.set(tracker.getState());
    registry.setGeneratedFiles(runId, generatedFiles);

    return {
      runId,
      projectSlug,
      status: "completed",
      outputPath,
      generatedFiles: [...new Set(generatedFiles)].sort(),
    };
  } catch (error) {
    const normalizedError =
      error instanceof Error
        ? error
        : new Error(
            error instanceof ZodError
              ? error.message
              : "Unknown workflow error",
          );
    await tracker.fail(normalizedError);
    registry.set(tracker.getState());
    throw normalizedError;
  }
}
