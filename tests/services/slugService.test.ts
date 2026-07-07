import { describe, expect, it } from "vitest";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  createUniqueProjectSlug,
  slugifyTitle,
} from "../../src/services/slugService";

describe("slugService", () => {
  it("slugifies the title", () => {
    expect(slugifyTitle("The Shadow Crown")).toBe("the-shadow-crown");
  });

  it("adds a timestamp suffix when the folder exists", async () => {
    const outputsDir = await mkdtemp(join(tmpdir(), "nova-slug-"));
    await mkdir(join(outputsDir, "the-shadow-crown"));

    const slug = await createUniqueProjectSlug("The Shadow Crown", outputsDir);

    expect(slug).toMatch(/^the-shadow-crown-\d{4}-\d{2}-\d{2}-\d{4}$/);
    await rm(outputsDir, { recursive: true, force: true });
  });
});
