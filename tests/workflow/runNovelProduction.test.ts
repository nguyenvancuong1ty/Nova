import { describe, expect, it } from "vitest";
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
});
