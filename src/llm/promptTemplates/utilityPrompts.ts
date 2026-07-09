import type { Scene } from "../../types";
import type { LlmMessage } from "../types";

export function buildSubtitlePrompt(
  chapterNumber: number,
  scenes: Scene[],
): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a subtitle formatter. Return valid JSON only for subtitle segments.",
    },
    {
      role: "user",
      content: JSON.stringify({ chapterNumber, scenes }),
    },
  ];
}
