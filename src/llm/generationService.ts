import type { ZodType } from "zod";
import type { LlmConfig } from "../config/llmConfig";
import { getGenerationConfig } from "./generationConfig";
import { parseStructuredJson } from "./outputParsers/jsonParser";
import { parseMarkdown } from "./outputParsers/markdownParser";
import type {
  LlmGenerationResult,
  LlmMarkdownResult,
  LlmMessage,
  LlmStepId,
} from "./types";

interface GenerationClient {
  generate: (input: {
    model: string;
    messages: LlmMessage[];
    temperature?: number;
    max_tokens?: number;
  }) => Promise<{ content: string; raw: unknown }>;
}

interface GenerationServiceOptions {
  client: GenerationClient;
  models: LlmConfig["models"];
}

export interface GenerationService {
  generateMarkdown(input: {
    step: LlmStepId;
    messages: LlmMessage[];
  }): Promise<LlmMarkdownResult>;
  generateStructured<T>(input: {
    step: LlmStepId;
    schema: ZodType<T>;
    messages: LlmMessage[];
  }): Promise<LlmGenerationResult<T>>;
}

export function createGenerationService(
  options: GenerationServiceOptions,
): GenerationService {
  function resolveModel(step: LlmStepId): string {
    const config = getGenerationConfig(step);
    return options.models[config.tier];
  }

  return {
    async generateMarkdown(input) {
      const config = getGenerationConfig(input.step);
      const response = await options.client.generate({
        model: resolveModel(input.step),
        messages: input.messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      });

      return {
        content: parseMarkdown(response.content),
        raw: response.raw,
      };
    },

    async generateStructured<T>(input: {
      step: LlmStepId;
      schema: ZodType<T>;
      messages: LlmMessage[];
    }) {
      const config = getGenerationConfig(input.step);
      const response = await options.client.generate({
        model: resolveModel(input.step),
        messages: input.messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      });

      return {
        data: parseStructuredJson(response.content, input.schema),
        raw: response.raw,
      };
    },
  };
}
