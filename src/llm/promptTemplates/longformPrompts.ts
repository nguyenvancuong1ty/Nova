import type { ChapterPlanEntry, ContinuityReport, ProductionInput } from "../../types";
import type { LlmMessage } from "../types";
import { buildMarkdownContract } from "./contracts";

export function buildChapterDraftPrompt(
  input: ProductionInput,
  chapterPlan: ChapterPlanEntry,
): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        `You are a long-form fiction writer. ${buildMarkdownContract({
          title: `# Chapter ${String(chapterPlan.chapterNumber).padStart(4, "0")} - ${chapterPlan.title}`,
          requiredSections: ["Chapter Text"],
        })} Write polished continuous prose under the chapter text section.`,
    },
    {
      role: "user",
      content: JSON.stringify({ input, chapterPlan }),
    },
  ];
}

export function buildRevisionPrompt(
  chapterDraft: string,
  report: ContinuityReport,
): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        `You are an editor revising a novel chapter in Vietnamese while preserving story intent. ${buildMarkdownContract({
          title: "# Revised Chapter",
          requiredSections: ["Chapter Text", "Revision Notes"],
        })}`,
    },
    {
      role: "user",
      content: JSON.stringify({ chapterDraft, report }),
    },
  ];
}
