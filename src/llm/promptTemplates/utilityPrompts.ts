import type { Scene } from "../../types";
import type { LlmMessage } from "../types";
import { buildStructuredArrayContract } from "./contracts";

export function buildSubtitlePrompt(
  chapterNumber: number,
  scenes: Scene[],
): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        `You are a subtitle formatter. ${buildStructuredArrayContract({
          itemName: "subtitle segment",
          fields: ["index", "startSeconds", "endSeconds", "text"],
          cardinality: `exactly ${scenes.length} items, one for every input scene`,
          constraints: [
            "index must start at 1 and be sequential without duplicates.",
            "startSeconds and endSeconds must be non-negative integers, and endSeconds must be greater than startSeconds.",
            "text must be a non-empty Vietnamese subtitle line.",
          ],
        })}`,
    },
    {
      role: "user",
      content: JSON.stringify({ chapterNumber, scenes }),
    },
  ];
}
