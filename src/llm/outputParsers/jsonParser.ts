import type { ZodType } from "zod";

export function parseStructuredJson<T>(content: string, schema: ZodType<T>): T {
  const parsed = JSON.parse(content) as unknown;
  return schema.parse(parsed);
}
