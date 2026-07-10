import type { ProductionInput, Scene } from "../../types";
import type { LlmMessage } from "../types";
import {
  buildMarkdownContract,
  buildStructuredArrayContract,
} from "./contracts";

export function buildImagePromptPrompt(
  input: ProductionInput,
  chapterNumber: number,
  scenes: Scene[],
): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        `You are an adaptation prompt designer. ${buildStructuredArrayContract({
          itemName: "image prompt",
          fields: [
            "id",
            "chapterNumber",
            "sceneNumber",
            "prompt",
            "negativePrompt",
            "aspectRatio",
            "style",
            "characterReferences",
            "characterConsistencyNotes",
          ],
          cardinality: `exactly ${scenes.length} items, one for every input scene`,
          constraints: [
            `chapterNumber must be ${chapterNumber} for every item.`,
            "sceneNumber must match each input scene exactly once.",
            'aspectRatio must be one of "16:9", "9:16", or "1:1".',
            "characterReferences and characterConsistencyNotes must be arrays of strings.",
          ],
        })}`,
    },
    {
      role: "user",
      content: JSON.stringify({ input, chapterNumber, scenes }),
    },
  ];
}

export function buildVideoPromptPrompt(
  input: ProductionInput,
  chapterNumber: number,
  scenes: Scene[],
): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        `You are a cinematic prompt designer. ${buildStructuredArrayContract({
          itemName: "video prompt",
          fields: [
            "id",
            "chapterNumber",
            "sceneNumber",
            "prompt",
            "cameraMovement",
            "durationSeconds",
            "motionNotes",
            "soundDesignNotes",
          ],
          cardinality: `exactly ${scenes.length} items, one for every input scene`,
          constraints: [
            `chapterNumber must be ${chapterNumber} for every item.`,
            "sceneNumber must match each input scene exactly once.",
            "durationSeconds must be a positive integer.",
          ],
        })}`,
    },
    {
      role: "user",
      content: JSON.stringify({ input, chapterNumber, scenes }),
    },
  ];
}

export function buildVoiceoverPrompt(
  chapterNumber: number,
  scenes: Scene[],
): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        `You are a narration writer. ${buildMarkdownContract({
          title: `# Voiceover - Chapter ${String(chapterNumber).padStart(4, "0")}`,
          requiredSections: ["Narration"],
          sceneBased: true,
        })}`,
    },
    {
      role: "user",
      content: JSON.stringify({ chapterNumber, scenes }),
    },
  ];
}
