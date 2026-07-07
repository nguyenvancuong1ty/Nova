import type { RunState } from "../types";

export class RunRegistry {
  private readonly runs = new Map<string, RunState>();
  private readonly cancellations = new Set<string>();
  private readonly generatedFiles = new Map<string, string[]>();

  set(state: RunState): void {
    this.runs.set(state.runId, state);
  }

  get(runId: string): RunState | undefined {
    return this.runs.get(runId);
  }

  setGeneratedFiles(runId: string, files: string[]): void {
    this.generatedFiles.set(runId, files);
  }

  getGeneratedFiles(runId: string): string[] {
    return this.generatedFiles.get(runId) ?? [];
  }

  cancel(runId: string): void {
    this.cancellations.add(runId);
  }

  isCancelled(runId: string): boolean {
    return this.cancellations.has(runId);
  }
}
