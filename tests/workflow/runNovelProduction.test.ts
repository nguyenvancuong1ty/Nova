import { describe, expect, it, vi } from "vitest";
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validProductionInput } from "../fixtures/validProductionInput";
import { runNovelProduction } from "../../src/workflow/runNovelProduction";

describe("runNovelProduction", () => {
  it("creates the required output package for a 1 chapter run", async () => {
    const root = await mkdtemp(join(tmpdir(), "nova-workflow-"));
    const result = await runNovelProduction(validProductionInput, {
      outputsDir: root,
    });

    expect(result.status).toBe("completed");
    expect(result.generatedFiles).toContain("knowledge-base/story-bible.md");
    expect(result.generatedFiles).toContain(
      "chapters/chapter-0001/chapter-final.md",
    );
    expect(result.generatedFiles).toContain(
      "chapters/chapter-0001/scenes.json",
    );
    expect(result.generatedFiles).toContain(
      "chapters/chapter-0001/image-prompts.json",
    );
    expect(result.generatedFiles).toContain(
      "chapters/chapter-0001/video-prompts.json",
    );
    expect(result.generatedFiles).toContain("exports/full-novel.md");
  });

  it("accepts an injected generation service and still completes the workflow", async () => {
    const root = await mkdtemp(join(tmpdir(), "nova-workflow-"));
    const generationService = {
      generateMarkdown: vi.fn().mockImplementation(async ({ step }: { step: string }) => {
        switch (step) {
          case "generate_story_bible":
            return { content: "# Story Bible\n\nGenerated", raw: {} };
          case "generate_world_bible":
            return { content: "# World Bible\n\nGenerated", raw: {} };
          case "generate_character_bible":
            return { content: "# Character Bible\n\nGenerated", raw: {} };
          case "generate_chapter_draft":
            return {
              content: "# Chapter 0001 - Arc 1\n\nGenerated chapter draft.",
              raw: {},
            };
          case "revise_chapter":
            return {
              content: "# Chapter 0001 - Arc 1\n\nGenerated chapter final.",
              raw: {},
            };
          case "generate_storyboard":
            return {
              content: "# Storyboard - Chapter 0001\n\nGenerated storyboard.",
              raw: {},
            };
          case "generate_voiceover":
            return {
              content: "# Voiceover - Chapter 0001\n\nGenerated voiceover.",
              raw: {},
            };
          default:
            return { content: "# Generated\n\nFallback", raw: {} };
        }
      }),
      generateStructured: vi.fn().mockImplementation(async ({ step }: { step: string }) => {
        switch (step) {
          case "generate_arc_plan":
            return {
              data: [
                {
                  id: "arc-01",
                  title: "Arc 1",
                  startChapter: 1,
                  endChapter: 1,
                  premise: "Premise",
                  mainConflict: "Conflict",
                  keyReveals: ["Reveal"],
                  emotionalProgression: "Progression",
                  expectedEnding: "Ending",
                },
              ],
              raw: {},
            };
          case "generate_chapter_plan":
            return {
              data: [
                {
                  chapterNumber: 1,
                  title: "Chapter 0001 - Arc 1",
                  arcId: "arc-01",
                  mainGoal: "Goal",
                  mainConflict: "Conflict",
                  requiredCharacters: ["protagonist"],
                  requiredLocations: ["Ruined chapel"],
                  emotionalBeat: "Beat",
                  mysteryProgress: "Progress",
                  romanceProgress: "Romance",
                  endingHook: "Hook",
                  videoFocus: "Focus",
                },
              ],
              raw: {},
            };
          case "split_chapter_into_scenes":
            return {
              data: [
                {
                  id: "scene-ch0001-sc001",
                  chapterNumber: 1,
                  sceneNumber: 1,
                  title: "Scene 01",
                  location: "Ruined chapel",
                  characters: ["protagonist"],
                  purpose: "Move plot",
                  summary: "Generated scene summary.",
                  visualFocus: "Moonlit altar",
                  emotionalBeat: "Beat",
                  videoPotential: "high",
                },
              ],
              raw: {},
            };
          case "generate_image_prompts":
            return {
              data: [
                {
                  id: "image-ch0001-sc001",
                  chapterNumber: 1,
                  sceneNumber: 1,
                  prompt: "Generated image prompt.",
                  aspectRatio: "16:9",
                  style: "Dark fantasy",
                  characterReferences: ["character:protagonist"],
                  characterConsistencyNotes: ["Keep appearance stable."],
                },
              ],
              raw: {},
            };
          case "generate_video_prompts":
            return {
              data: [
                {
                  id: "video-ch0001-sc001",
                  chapterNumber: 1,
                  sceneNumber: 1,
                  prompt: "Generated video prompt.",
                  cameraMovement: "slow push-in",
                  durationSeconds: 6,
                  motionNotes: "Generated motion notes.",
                  soundDesignNotes: "Generated sound notes.",
                },
              ],
              raw: {},
            };
          case "generate_subtitles":
            return {
              data: [
                {
                  index: 1,
                  startSeconds: 0,
                  endSeconds: 6,
                  text: "Generated subtitle line.",
                },
              ],
              raw: {},
            };
          default:
            return { data: [], raw: {} };
        }
      }),
    };

    const result = await runNovelProduction(validProductionInput, {
      outputsDir: root,
      generationService,
    });

    expect(result.status).toBe("completed");
    expect(generationService.generateMarkdown).toHaveBeenCalledTimes(7);
    expect(generationService.generateStructured).toHaveBeenCalledTimes(6);
  });
});
