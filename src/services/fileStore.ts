import { Dirent } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export interface FileStore {
  readText(filePath: string): Promise<string>;
  writeText(filePath: string, content: string): Promise<void>;
  readJson<T>(filePath: string): Promise<T>;
  writeJson<T>(filePath: string, data: T): Promise<void>;
  exists(targetPath: string): Promise<boolean>;
  ensureDir(targetPath: string): Promise<void>;
  listFiles(targetPath: string, extension?: string): Promise<string[]>;
}

export function createFileStore(): FileStore {
  return {
    async readText(filePath) {
      return readFile(filePath, "utf8");
    },
    async writeText(filePath, content) {
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, content, "utf8");
    },
    async readJson<T>(filePath: string) {
      const content = await readFile(filePath, "utf8");
      return JSON.parse(content) as T;
    },
    async writeJson<T>(filePath: string, data: T) {
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    },
    async exists(targetPath: string) {
      try {
        await stat(targetPath);
        return true;
      } catch {
        return false;
      }
    },
    async ensureDir(targetPath: string) {
      await mkdir(targetPath, { recursive: true });
    },
    async listFiles(targetPath: string, extension?: string) {
      const entries = await readdir(targetPath, { withFileTypes: true });

      return entries
        .filter((entry: Dirent) => entry.isFile())
        .map((entry: Dirent) => `${targetPath}/${entry.name}`)
        .filter((filePath: string) =>
          extension ? filePath.endsWith(extension) : true,
        )
        .sort();
    },
  };
}
