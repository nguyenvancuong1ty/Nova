import { createLogService } from "../services/logService";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";
import type { RunState } from "../types";
import { toIsoTimestamp } from "../utils/date";
import { getRunLogPath, getRunStatePath } from "../utils/path";

interface ProgressTrackerOptions {
  runId: string;
  projectSlug: string;
  totalChapters: number;
  outputPath: string;
}

export interface ProgressTracker {
  setStep(step: string): Promise<void>;
  setChapter(chapterNumber: number): Promise<void>;
  log(message: string): Promise<void>;
  fail(error: Error): Promise<void>;
  cancel(): Promise<void>;
  complete(): Promise<void>;
  getState(): RunState;
}

function createInitialState(options: ProgressTrackerOptions): RunState {
  return {
    runId: options.runId,
    projectSlug: options.projectSlug,
    status: "running",
    totalChapters: options.totalChapters,
    progressPercent: 0,
    startedAt: toIsoTimestamp(),
    outputPath: options.outputPath,
    logs: [],
  };
}

export async function createProgressTracker(
  options: ProgressTrackerOptions,
  fileStore: FileStore = createFileStore(),
): Promise<ProgressTracker> {
  const state = createInitialState(options);
  const statePath = getRunStatePath(options.outputPath);
  const logPath = getRunLogPath(options.outputPath);
  const logService = createLogService(logPath, fileStore);

  async function persistState() {
    await fileStore.writeJson(statePath, state);
  }

  async function appendLog(message: string) {
    const entry = `[${toIsoTimestamp()}] ${message}`;
    state.logs = [...state.logs, entry].slice(-50);
    await logService.append(entry);
    await persistState();
  }

  await persistState();
  await appendLog("Started production workflow");

  return {
    async setStep(step: string) {
      state.currentStep = step;
      state.progressPercent = Math.min(95, state.progressPercent + 5);
      await persistState();
      await appendLog(`Current step: ${step}`);
    },
    async setChapter(chapterNumber: number) {
      state.currentChapter = chapterNumber;
      const chapterProgress = Math.round(
        (chapterNumber / Math.max(state.totalChapters, 1)) * 80,
      );
      state.progressPercent = Math.max(state.progressPercent, chapterProgress);
      await persistState();
      await appendLog(`Current chapter: ${chapterNumber}`);
    },
    async log(message: string) {
      await appendLog(message);
    },
    async fail(error: Error) {
      state.status = "failed";
      state.error = error.message;
      state.finishedAt = toIsoTimestamp();
      state.progressPercent = 100;
      await persistState();
      await appendLog(`Workflow failed: ${error.message}`);
    },
    async cancel() {
      state.status = "cancelled";
      state.finishedAt = toIsoTimestamp();
      await persistState();
      await appendLog("Workflow cancelled");
    },
    async complete() {
      state.status = "completed";
      state.finishedAt = toIsoTimestamp();
      state.progressPercent = 100;
      await persistState();
      await appendLog("Workflow completed");
    },
    getState() {
      return structuredClone(state);
    },
  };
}
