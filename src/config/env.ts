export interface EnvConfig {
  openRouterApiKey: string;
  openRouterBaseUrl: string;
  openRouterAppName?: string;
  openRouterAppUrl?: string;
  tierPlanningModel: string;
  tierLongformModel: string;
  tierSceneModel: string;
  tierAdaptationModel: string;
  tierUtilityModel: string;
}

const requiredKeys = [
  "OPENROUTER_API_KEY",
  "OPENROUTER_MODEL_TIER_PLANNING",
  "OPENROUTER_MODEL_TIER_LONGFORM",
  "OPENROUTER_MODEL_TIER_SCENE",
  "OPENROUTER_MODEL_TIER_ADAPTATION",
  "OPENROUTER_MODEL_TIER_UTILITY",
] as const;

export function loadEnvConfig(
  source: NodeJS.ProcessEnv = process.env,
): EnvConfig {
  for (const key of requiredKeys) {
    if (!source[key]?.trim()) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    openRouterApiKey: source.OPENROUTER_API_KEY!,
    openRouterBaseUrl:
      source.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
    openRouterAppName: source.OPENROUTER_APP_NAME,
    openRouterAppUrl: source.OPENROUTER_APP_URL,
    tierPlanningModel: source.OPENROUTER_MODEL_TIER_PLANNING!,
    tierLongformModel: source.OPENROUTER_MODEL_TIER_LONGFORM!,
    tierSceneModel: source.OPENROUTER_MODEL_TIER_SCENE!,
    tierAdaptationModel: source.OPENROUTER_MODEL_TIER_ADAPTATION!,
    tierUtilityModel: source.OPENROUTER_MODEL_TIER_UTILITY!,
  };
}
