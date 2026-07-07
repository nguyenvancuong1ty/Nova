import { beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createFileStore } from "../../src/services/fileStore";

describe("fileStore", () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "nova-file-store-"));
  });

  it("writes and reads text and json", async () => {
    const store = createFileStore();
    const textPath = join(root, "notes", "story.md");
    const jsonPath = join(root, "input", "production.json");

    await store.writeText(textPath, "hello");
    await store.writeJson(jsonPath, { title: "Nova" });

    await expect(store.readText(textPath)).resolves.toBe("hello");
    await expect(store.readJson<{ title: string }>(jsonPath)).resolves.toEqual({
      title: "Nova",
    });
  });

  it("ensures directories and reports existence", async () => {
    const store = createFileStore();
    const dirPath = join(root, "outputs", "project");

    await store.ensureDir(dirPath);

    await expect(store.exists(dirPath)).resolves.toBe(true);
  });

  it("lists files by extension", async () => {
    const store = createFileStore();
    const dirPath = join(root, "exports");

    await store.writeText(join(dirPath, "a.md"), "a");
    await store.writeText(join(dirPath, "b.json"), "{}");

    await expect(store.listFiles(dirPath, ".md")).resolves.toEqual([
      join(dirPath, "a.md"),
    ]);
  });

  it("cleans up temporary state", async () => {
    await rm(root, { recursive: true, force: true });
    expect(true).toBe(true);
  });
});
