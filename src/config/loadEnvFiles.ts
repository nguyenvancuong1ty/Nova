import { existsSync } from "node:fs";
import { join } from "node:path";
import dotenv from "dotenv";

let loaded = false;

export function loadEnvFiles(cwd: string = process.cwd()): string[] {
  const candidates = [join(cwd, ".env"), join(cwd, "src", ".env")];
  const loadedPaths: string[] = [];

  for (const filePath of candidates) {
    if (!existsSync(filePath)) {
      continue;
    }

    dotenv.config({
      path: filePath,
      override: false,
    });
    loadedPaths.push(filePath);
  }

  loaded = true;
  return loadedPaths;
}

export function ensureEnvFilesLoaded(cwd?: string): void {
  if (loaded) {
    return;
  }

  loadEnvFiles(cwd);
}
