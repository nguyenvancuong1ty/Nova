import { describe, expect, it } from "vitest";
import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createFileStore } from "../../src/services/fileStore";
import { createProgressTracker } from "../../src/workflow/progressTracker";

describe("progressTracker", () => {
  it("updates step, chapter, logs, and completion state", async () => {
    const root = await mkdtemp(join(tmpdir(), "nova-progress-"));
    const outputPath = join(root, "outputs", "the-shadow-crown");
    const tracker = await createProgressTracker(
      {
        runId: "run_1",
        projectSlug: "the-shadow-crown",
        totalChapters: 3,
        outputPath,
      },
      createFileStore(),
    );

    await tracker.setStep("generate_story_bible");
    await tracker.setChapter(1);
    await tracker.log("Generated story bible");
    await tracker.complete();

    const state = tracker.getState();
    expect(state.currentStep).toBe("generate_story_bible");
    expect(state.currentChapter).toBe(1);
    expect(state.status).toBe("completed");

    const savedState = JSON.parse(
      await readFile(join(outputPath, "run-state.json"), "utf8"),
    );
    expect(savedState.status).toBe("completed");

    const runLog = await readFile(join(outputPath, "logs", "run.log"), "utf8");
    expect(runLog).toContain("Generated story bible");
  });
});
