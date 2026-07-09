import type { ChapterPlanEntry, ContinuityReport, ProductionInput } from "../../types";
import type { LlmMessage } from "../types";

export function buildChapterDraftPrompt(
  input: ProductionInput,
  chapterPlan: ChapterPlanEntry,
): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a long-form fiction writer. Write polished Vietnamese markdown.",
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
        "You are an editor revising a novel chapter in Vietnamese while preserving story intent.",
    },
    {
      role: "user",
      content: JSON.stringify({ chapterDraft, report }),
    },
  ];
}
