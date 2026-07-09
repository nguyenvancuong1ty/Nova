import type { EnvConfig } from "./env";

export interface LlmConfig {
  apiKey: string;
  baseUrl: string;
  appName?: string;
  appUrl?: string;
  models: {
    tier_planning: string;
    tier_longform: string;
    tier_scene: string;
    tier_adaptation: string;
    tier_utility: string;
  };
}

export function createLlmConfig(env: EnvConfig): LlmConfig {
  return {
    apiKey: env.openRouterApiKey,
    baseUrl: env.openRouterBaseUrl,
    appName: env.openRouterAppName,
    appUrl: env.openRouterAppUrl,
    models: {
      tier_planning: env.tierPlanningModel,
      tier_longform: env.tierLongformModel,
      tier_scene: env.tierSceneModel,
      tier_adaptation: env.tierAdaptationModel,
      tier_utility: env.tierUtilityModel,
    },
  };
}
