import { createLlmConfig } from "../config/llmConfig";
import { loadEnvConfig } from "../config/env";
import { createGenerationService, type GenerationService } from "./generationService";
import { createOpenRouterClient } from "./openrouterClient";

const tierKeys = [
  "OPENROUTER_MODEL_TIER_PLANNING",
  "OPENROUTER_MODEL_TIER_LONGFORM",
  "OPENROUTER_MODEL_TIER_SCENE",
  "OPENROUTER_MODEL_TIER_ADAPTATION",
  "OPENROUTER_MODEL_TIER_UTILITY",
] as const;

export function createRuntimeGenerationService(
  source: NodeJS.ProcessEnv = process.env,
): GenerationService | undefined {
  const hasAnyLlmConfig =
    Boolean(source.OPENROUTER_API_KEY) ||
    tierKeys.some((key) => Boolean(source[key]));

  if (!hasAnyLlmConfig) {
    return undefined;
  }

  const env = loadEnvConfig(source);
  const config = createLlmConfig(env);
  const client = createOpenRouterClient({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    appName: config.appName,
    appUrl: config.appUrl,
  });

  return createGenerationService({
    client,
    models: config.models,
  });
}
