import { createFileStore, type FileStore } from "./fileStore";

export interface LogService {
  append(message: string): Promise<void>;
}

export function createLogService(
  logPath: string,
  fileStore: FileStore = createFileStore(),
): LogService {
  return {
    async append(message: string) {
      const current = (await fileStore.exists(logPath))
        ? await fileStore.readText(logPath)
        : "";
      const next = current ? `${current}\n${message}` : message;
      await fileStore.writeText(logPath, next);
    },
  };
}
