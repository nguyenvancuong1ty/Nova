import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadEnvFiles } from "../../src/config/loadEnvFiles";

describe("loadEnvFiles", () => {
  const keys = [
    "OPENROUTER_API_KEY",
    "OPENROUTER_MODEL_TIER_PLANNING",
    "OPENROUTER_MODEL_TIER_LONGFORM",
    "OPENROUTER_MODEL_TIER_SCENE",
    "OPENROUTER_MODEL_TIER_ADAPTATION",
    "OPENROUTER_MODEL_TIER_UTILITY",
  ] as const;

  afterEach(() => {
    for (const key of keys) {
      delete process.env[key];
    }
  });

  it("loads repo .env before src/.env without overriding existing values", async () => {
    const root = await mkdtemp(join(tmpdir(), "nova-env-"));
    await mkdir(join(root, "src"), { recursive: true });

    await writeFile(
      join(root, ".env"),
      [
        "OPENROUTER_API_KEY=repo-key",
        "OPENROUTER_MODEL_TIER_PLANNING=repo/planning",
        "OPENROUTER_MODEL_TIER_LONGFORM=repo/longform",
      ].join("\n"),
    );

    await writeFile(
      join(root, "src", ".env"),
      [
        "OPENROUTER_API_KEY=src-key",
        "OPENROUTER_MODEL_TIER_SCENE=src/scene",
        "OPENROUTER_MODEL_TIER_ADAPTATION=src/adaptation",
        "OPENROUTER_MODEL_TIER_UTILITY=src/utility",
      ].join("\n"),
    );

    const loadedPaths = loadEnvFiles(root);

    expect(loadedPaths).toHaveLength(2);
    expect(process.env.OPENROUTER_API_KEY).toBe("repo-key");
    expect(process.env.OPENROUTER_MODEL_TIER_PLANNING).toBe("repo/planning");
    expect(process.env.OPENROUTER_MODEL_TIER_SCENE).toBe("src/scene");
    expect(process.env.OPENROUTER_MODEL_TIER_UTILITY).toBe("src/utility");
  });
});
