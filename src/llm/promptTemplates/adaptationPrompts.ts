import type { ProductionInput, Scene } from "../../types";
import type { LlmMessage } from "../types";

export function buildImagePromptPrompt(
  input: ProductionInput,
  chapterNumber: number,
  scenes: Scene[],
): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        "You are an adaptation prompt designer. Return valid JSON only.",
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
        "You are a cinematic prompt designer. Return valid JSON only.",
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
        "You are a narration writer. Return Vietnamese markdown for voiceover.",
    },
    {
      role: "user",
      content: JSON.stringify({ chapterNumber, scenes }),
    },
  ];
}
