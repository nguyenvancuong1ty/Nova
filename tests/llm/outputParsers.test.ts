import { z } from "zod";
import { describe, expect, it } from "vitest";
import { parseStructuredJson } from "../../src/llm/outputParsers/jsonParser";
import { parseMarkdown } from "../../src/llm/outputParsers/markdownParser";

describe("output parsers", () => {
  it("parses valid JSON into a typed object", () => {
    const schema = z.object({ title: z.string() });
    expect(parseStructuredJson('{"title":"Nova"}', schema)).toEqual({
      title: "Nova",
    });
  });

  it("throws on invalid JSON schema shape", () => {
    const schema = z.object({ title: z.string() });
    expect(() => parseStructuredJson('{"count":1}', schema)).toThrow(/title/i);
  });

  it("normalizes markdown output", () => {
    expect(parseMarkdown("  # Title\n\nBody\n")).toBe("# Title\n\nBody");
  });
});
