import { join } from "node:path";

export function getOutputsDir(rootDir: string): string {
  return join(rootDir, "outputs");
}

export function getRunStatePath(outputPath: string): string {
  return join(outputPath, "run-state.json");
}

export function getRunLogPath(outputPath: string): string {
  return join(outputPath, "logs", "run.log");
}
