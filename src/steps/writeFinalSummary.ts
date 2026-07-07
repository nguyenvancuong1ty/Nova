import { join } from "node:path";
import type { FileStore } from "../services/fileStore";
import { createFileStore } from "../services/fileStore";

interface WriteFinalSummaryInput {
  outputPath: string;
  projectTitle: string;
  totalChapters: number;
  totalScenes: number;
  warnings: string[];
}

export async function writeFinalSummary(
  input: WriteFinalSummaryInput,
  fileStore: FileStore = createFileStore(),
): Promise<string[]> {
  const summaryPath = "exports/production-summary.md";
  const continuityPath = "exports/final-continuity-report.md";
  const summary = `# Production Summary

- Project title: ${input.projectTitle}
- Total chapters generated: ${input.totalChapters}
- Total scenes generated: ${input.totalScenes}
- Output folder: ${input.outputPath}
- Any warnings: ${input.warnings.length > 0 ? input.warnings.join("; ") : "None"}
- Next recommended steps: Review chapter finals, prompts, and storyboard before Phase 2 integrations.
- Reminder: Phase 1 does not generate real images or videos.
`;
  const continuity = `# Final Continuity Report

${input.warnings.length > 0 ? input.warnings.map((warning) => `- ${warning}`).join("\n") : "- No warnings recorded."}
`;

  await fileStore.writeText(join(input.outputPath, summaryPath), summary);
  await fileStore.writeText(join(input.outputPath, continuityPath), continuity);
  return [summaryPath, continuityPath];
}
