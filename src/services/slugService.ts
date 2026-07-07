import { join } from "node:path";
import { createFileStore } from "./fileStore";

function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}-${hours}${minutes}`;
}

export function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export async function createUniqueProjectSlug(
  title: string,
  outputsDir: string,
): Promise<string> {
  const fileStore = createFileStore();
  const baseSlug = slugifyTitle(title);

  if (!(await fileStore.exists(join(outputsDir, baseSlug)))) {
    return baseSlug;
  }

  return `${baseSlug}-${formatTimestamp(new Date())}`;
}
