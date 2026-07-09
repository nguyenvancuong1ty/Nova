# Nova Phase 2 OpenRouter Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a provider-first OpenRouter generation subsystem with five model tiers, then migrate the existing deterministic workflow to use LLM-backed generation step by step.

**Architecture:** Keep `runNovelProduction()` as the outer orchestration shell and introduce a new `src/llm/` subsystem plus `src/config/` env parsing. Workflow steps become thin adapters over a typed generation service that resolves step config, prompt template, model tier, output parser, and retry behavior without leaking provider details into business logic.

**Tech Stack:** TypeScript, Zod, Express, Vite, Vitest, OpenRouter HTTP API

---

## File Map

- Create: `src/config/env.ts` for env parsing and required OpenRouter settings.
- Create: `src/config/llmConfig.ts` for tier/model config derived from env.
- Create: `src/llm/types.ts` for shared LLM request, response, tier, and step ids.
- Create: `src/llm/modelTiers.ts` for the five canonical tier ids and resolver helpers.
- Create: `src/llm/openrouterClient.ts` for direct provider transport.
- Create: `src/llm/generationConfig.ts` for `step -> tier -> output mode` mapping.
- Create: `src/llm/promptTemplates/*.ts` for prompt builders grouped by role.
- Create: `src/llm/schemas/*.ts` for structured LLM outputs.
- Create: `src/llm/outputParsers/*.ts` for markdown/json parsing and validation.
- Create: `src/llm/generationService.ts` for the internal workflow-facing generation API.
- Modify: `src/types/index.ts` to export any new typed LLM result contracts needed by steps.
- Modify: `src/workflow/runNovelProduction.ts` to inject/use the generation service without replacing orchestration.
- Modify: selected `src/steps/*.ts` in rollout waves, starting with Tier 1.
- Create: `tests/config/env.test.ts`
- Create: `tests/llm/modelTiers.test.ts`
- Create: `tests/llm/openrouterClient.test.ts`
- Create: `tests/llm/generationConfig.test.ts`
- Create: `tests/llm/outputParsers.test.ts`
- Create: `tests/llm/generationService.test.ts`
- Modify: `tests/workflow/runNovelProduction.test.ts`
- Create: step-level tests for migrated LLM-backed steps as they are introduced.
- Modify: `README.md` to document Phase 2 env requirements and rollout status.

### Task 1: Add env parsing and five-tier model configuration

**Files:**

- Create: `src/config/env.ts`
- Create: `src/config/llmConfig.ts`
- Create: `tests/config/env.test.ts`

- [ ] **Step 1: Write the failing env/config tests**

```ts
import { describe, expect, it } from "vitest";
import { loadEnvConfig } from "../../src/config/env";
import { createLlmConfig } from "../../src/config/llmConfig";

describe("loadEnvConfig", () => {
  it("reads the required OpenRouter API key and tier model ids", () => {
    const env = loadEnvConfig({
      OPENROUTER_API_KEY: "sk-test",
      OPENROUTER_MODEL_TIER_PLANNING: "openrouter/planning",
      OPENROUTER_MODEL_TIER_LONGFORM: "openrouter/longform",
      OPENROUTER_MODEL_TIER_SCENE: "openrouter/scene",
      OPENROUTER_MODEL_TIER_ADAPTATION: "openrouter/adaptation",
      OPENROUTER_MODEL_TIER_UTILITY: "openrouter/utility",
    });

    const config = createLlmConfig(env);
    expect(config.apiKey).toBe("sk-test");
    expect(config.models.tier_planning).toBe("openrouter/planning");
    expect(config.models.tier_utility).toBe("openrouter/utility");
  });

  it("throws when a required tier model is missing", () => {
    expect(() =>
      loadEnvConfig({
        OPENROUTER_API_KEY: "sk-test",
        OPENROUTER_MODEL_TIER_PLANNING: "openrouter/planning",
      }),
    ).toThrow(/OPENROUTER_MODEL_TIER_LONGFORM/i);
  });
});
```

- [ ] **Step 2: Run the env/config test to verify it fails**

Run: `npm run test -- tests/config/env.test.ts`
Expected: FAIL because `src/config/env.ts` and `src/config/llmConfig.ts` do not exist yet.

- [ ] **Step 3: Implement env parsing with an explicit override input**

```ts
// src/config/env.ts
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

export function loadEnvConfig(
  source: NodeJS.ProcessEnv = process.env,
): EnvConfig {
  const required = [
    "OPENROUTER_API_KEY",
    "OPENROUTER_MODEL_TIER_PLANNING",
    "OPENROUTER_MODEL_TIER_LONGFORM",
    "OPENROUTER_MODEL_TIER_SCENE",
    "OPENROUTER_MODEL_TIER_ADAPTATION",
    "OPENROUTER_MODEL_TIER_UTILITY",
  ] as const;

  for (const key of required) {
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
```

```ts
// src/config/llmConfig.ts
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
```

- [ ] **Step 4: Run the env/config test to verify it passes**

Run: `npm run test -- tests/config/env.test.ts`
Expected: PASS

- [ ] **Step 5: Commit the env/config foundation**

```bash
git add src/config/env.ts src/config/llmConfig.ts tests/config/env.test.ts
git commit -m "feat: add openrouter env configuration"
```

### Task 2: Define tier ids, step ids, and generation config mapping

**Files:**

- Create: `src/llm/types.ts`
- Create: `src/llm/modelTiers.ts`
- Create: `src/llm/generationConfig.ts`
- Create: `tests/llm/modelTiers.test.ts`
- Create: `tests/llm/generationConfig.test.ts`

- [ ] **Step 1: Write the failing tier and generation-config tests**

```ts
import { describe, expect, it } from "vitest";
import { LLM_STEP_IDS, resolveTierForStep } from "../../src/llm/modelTiers";
import { getGenerationConfig } from "../../src/llm/generationConfig";

describe("model tier resolution", () => {
  it("maps planning steps to the planning tier", () => {
    expect(resolveTierForStep("generate_story_bible")).toBe("tier_planning");
    expect(resolveTierForStep("generate_chapter_plan")).toBe("tier_planning");
  });

  it("maps subtitle generation to the utility tier", () => {
    expect(resolveTierForStep("generate_subtitles")).toBe("tier_utility");
  });
});

describe("generation config", () => {
  it("defines structured output for arc plan generation", () => {
    const config = getGenerationConfig("generate_arc_plan");
    expect(config.outputMode).toBe("json");
    expect(config.tier).toBe("tier_planning");
  });

  it("defines markdown output for chapter drafting", () => {
    const config = getGenerationConfig("generate_chapter_draft");
    expect(config.outputMode).toBe("markdown");
    expect(config.tier).toBe("tier_longform");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- tests/llm/modelTiers.test.ts tests/llm/generationConfig.test.ts`
Expected: FAIL because the `src/llm/` tier and config modules do not exist yet.

- [ ] **Step 3: Implement the shared LLM types**

```ts
// src/llm/types.ts
export type LlmTier =
  | "tier_planning"
  | "tier_longform"
  | "tier_scene"
  | "tier_adaptation"
  | "tier_utility";

export type OutputMode = "markdown" | "json";

export type LlmStepId =
  | "generate_story_bible"
  | "generate_world_bible"
  | "generate_character_bible"
  | "generate_arc_plan"
  | "generate_chapter_plan"
  | "generate_chapter_draft"
  | "revise_chapter"
  | "split_chapter_into_scenes"
  | "generate_storyboard"
  | "generate_image_prompts"
  | "generate_video_prompts"
  | "generate_voiceover"
  | "generate_subtitles";
```

- [ ] **Step 4: Implement the step-to-tier resolver**

```ts
// src/llm/modelTiers.ts
import type { LlmStepId, LlmTier } from "./types";

export const LLM_STEP_IDS: readonly LlmStepId[] = [
  "generate_story_bible",
  "generate_world_bible",
  "generate_character_bible",
  "generate_arc_plan",
  "generate_chapter_plan",
  "generate_chapter_draft",
  "revise_chapter",
  "split_chapter_into_scenes",
  "generate_storyboard",
  "generate_image_prompts",
  "generate_video_prompts",
  "generate_voiceover",
  "generate_subtitles",
] as const;

const stepTierMap: Record<LlmStepId, LlmTier> = {
  generate_story_bible: "tier_planning",
  generate_world_bible: "tier_planning",
  generate_character_bible: "tier_planning",
  generate_arc_plan: "tier_planning",
  generate_chapter_plan: "tier_planning",
  generate_chapter_draft: "tier_longform",
  revise_chapter: "tier_longform",
  split_chapter_into_scenes: "tier_scene",
  generate_storyboard: "tier_scene",
  generate_image_prompts: "tier_adaptation",
  generate_video_prompts: "tier_adaptation",
  generate_voiceover: "tier_adaptation",
  generate_subtitles: "tier_utility",
};

export function resolveTierForStep(step: LlmStepId): LlmTier {
  return stepTierMap[step];
}
```

- [ ] **Step 5: Implement the generation config mapping**

```ts
// src/llm/generationConfig.ts
import { resolveTierForStep } from "./modelTiers";
import type { LlmStepId, OutputMode } from "./types";

export interface GenerationConfig {
  step: LlmStepId;
  tier: ReturnType<typeof resolveTierForStep>;
  outputMode: OutputMode;
  temperature: number;
  maxTokens: number;
  repairAttempts: number;
}

const structuredSteps = new Set<LlmStepId>([
  "generate_arc_plan",
  "generate_chapter_plan",
  "split_chapter_into_scenes",
  "generate_image_prompts",
  "generate_video_prompts",
  "generate_subtitles",
]);

export function getGenerationConfig(step: LlmStepId): GenerationConfig {
  return {
    step,
    tier: resolveTierForStep(step),
    outputMode: structuredSteps.has(step) ? "json" : "markdown",
    temperature: step === "generate_chapter_draft" ? 0.9 : 0.4,
    maxTokens: step === "generate_chapter_draft" ? 12000 : 4000,
    repairAttempts: structuredSteps.has(step) ? 2 : 0,
  };
}
```

- [ ] **Step 6: Run the tier and generation-config tests to verify they pass**

Run: `npm run test -- tests/llm/modelTiers.test.ts tests/llm/generationConfig.test.ts`
Expected: PASS

- [ ] **Step 7: Commit the tier/config mapping**

```bash
git add src/llm/types.ts src/llm/modelTiers.ts src/llm/generationConfig.ts tests/llm/modelTiers.test.ts tests/llm/generationConfig.test.ts
git commit -m "feat: add llm tier routing and generation config"
```

### Task 3: Implement the OpenRouter transport client

**Files:**

- Create: `src/llm/openrouterClient.ts`
- Create: `tests/llm/openrouterClient.test.ts`

- [ ] **Step 1: Write the failing transport tests**

```ts
import { describe, expect, it, vi } from "vitest";
import { createOpenRouterClient } from "../../src/llm/openrouterClient";

describe("openrouterClient", () => {
  it("sends a chat completion request with auth and model metadata", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "hello" } }],
      }),
    });

    const client = createOpenRouterClient({
      apiKey: "sk-test",
      baseUrl: "https://openrouter.ai/api/v1",
      fetchImpl: fetchMock,
      appName: "Nova",
    });

    const result = await client.generate({
      model: "openrouter/planning",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.content).toBe("hello");
  });

  it("throws a normalized error on non-2xx responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    const client = createOpenRouterClient({
      apiKey: "sk-test",
      baseUrl: "https://openrouter.ai/api/v1",
      fetchImpl: fetchMock,
    });

    await expect(
      client.generate({
        model: "openrouter/planning",
        messages: [{ role: "user", content: "hi" }],
      }),
    ).rejects.toThrow(/401/i);
  });
});
```

- [ ] **Step 2: Run the transport test to verify it fails**

Run: `npm run test -- tests/llm/openrouterClient.test.ts`
Expected: FAIL because `src/llm/openrouterClient.ts` does not exist yet.

- [ ] **Step 3: Implement the transport client with injectable `fetch`**

```ts
// src/llm/openrouterClient.ts
interface OpenRouterClientOptions {
  apiKey: string;
  baseUrl: string;
  appName?: string;
  appUrl?: string;
  fetchImpl?: typeof fetch;
}

interface GenerateRequest {
  model: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  max_tokens?: number;
}

export function createOpenRouterClient(options: OpenRouterClientOptions) {
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async generate(request: GenerateRequest) {
      const response = await fetchImpl(`${options.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "Content-Type": "application/json",
          ...(options.appName ? { "X-Title": options.appName } : {}),
          ...(options.appUrl ? { Referer: options.appUrl } : {}),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const message =
          "text" in response ? await response.text() : "OpenRouter request failed";
        throw new Error(`OpenRouter request failed (${response.status}): ${message}`);
      }

      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("OpenRouter response did not include message content");
      }

      return { content, raw: payload };
    },
  };
}
```

- [ ] **Step 4: Run the transport test to verify it passes**

Run: `npm run test -- tests/llm/openrouterClient.test.ts`
Expected: PASS

- [ ] **Step 5: Commit the transport client**

```bash
git add src/llm/openrouterClient.ts tests/llm/openrouterClient.test.ts
git commit -m "feat: add openrouter transport client"
```

### Task 4: Build prompt families, output schemas, and parser/repair layer

**Files:**

- Create: `src/llm/promptTemplates/planningPrompts.ts`
- Create: `src/llm/promptTemplates/longformPrompts.ts`
- Create: `src/llm/promptTemplates/scenePrompts.ts`
- Create: `src/llm/promptTemplates/adaptationPrompts.ts`
- Create: `src/llm/promptTemplates/utilityPrompts.ts`
- Create: `src/llm/schemas/arcPlan.schema.ts`
- Create: `src/llm/schemas/chapterPlan.schema.ts`
- Create: `src/llm/schemas/sceneBreakdown.schema.ts`
- Create: `src/llm/outputParsers/jsonParser.ts`
- Create: `src/llm/outputParsers/markdownParser.ts`
- Create: `tests/llm/outputParsers.test.ts`

- [ ] **Step 1: Write the failing parser tests**

```ts
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseStructuredJson } from "../../src/llm/outputParsers/jsonParser";
import { parseMarkdown } from "../../src/llm/outputParsers/markdownParser";

describe("output parsers", () => {
  it("parses valid JSON into a typed object", () => {
    const schema = z.object({ title: z.string() });
    expect(parseStructuredJson('{"title":"Nova"}', schema)).toEqual({
      title: "Nova",
    });
  });

  it("throws on invalid JSON schema shape", () => {
    const schema = z.object({ title: z.string() });
    expect(() => parseStructuredJson('{"count":1}', schema)).toThrow(/title/i);
  });

  it("normalizes markdown output", () => {
    expect(parseMarkdown("  # Title\\n\\nBody\\n")).toBe("# Title\\n\\nBody");
  });
});
```

- [ ] **Step 2: Run the parser test to verify it fails**

Run: `npm run test -- tests/llm/outputParsers.test.ts`
Expected: FAIL because parser modules do not exist yet.

- [ ] **Step 3: Implement the parser layer**

```ts
// src/llm/outputParsers/jsonParser.ts
import type { ZodType } from "zod";

export function parseStructuredJson<T>(content: string, schema: ZodType<T>): T {
  const parsed = JSON.parse(content) as unknown;
  return schema.parse(parsed);
}
```

```ts
// src/llm/outputParsers/markdownParser.ts
export function parseMarkdown(content: string): string {
  return content.trim();
}
```

- [ ] **Step 4: Add the first structured schemas used by Tier 1 and Tier 3**

```ts
// src/llm/schemas/arcPlan.schema.ts
import { z } from "zod";

export const LlmArcPlanSchema = z.array(
  z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    startChapter: z.number().int().min(1),
    endChapter: z.number().int().min(1),
    premise: z.string().min(1),
    mainConflict: z.string().min(1),
    keyReveals: z.array(z.string().min(1)),
    emotionalProgression: z.string().min(1),
    expectedEnding: z.string().min(1),
  }),
);
```

- [ ] **Step 5: Run the parser test to verify it passes**

Run: `npm run test -- tests/llm/outputParsers.test.ts`
Expected: PASS

- [ ] **Step 6: Commit the prompt/parser/schema foundation**

```bash
git add src/llm/promptTemplates src/llm/schemas src/llm/outputParsers tests/llm/outputParsers.test.ts
git commit -m "feat: add llm prompt and parser foundation"
```

### Task 5: Implement the generation service facade

**Files:**

- Create: `src/llm/generationService.ts`
- Create: `tests/llm/generationService.test.ts`

- [ ] **Step 1: Write the failing generation-service tests**

```ts
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createGenerationService } from "../../src/llm/generationService";

describe("generationService", () => {
  it("routes a structured step through the configured tier and parser", async () => {
    const client = {
      generate: vi.fn().mockResolvedValue({
        content: '{"title":"Arc 1"}',
        raw: {},
      }),
    };

    const service = createGenerationService({
      client,
      models: {
        tier_planning: "model/planning",
        tier_longform: "model/longform",
        tier_scene: "model/scene",
        tier_adaptation: "model/adaptation",
        tier_utility: "model/utility",
      },
    });

    const result = await service.generateStructured({
      step: "generate_arc_plan",
      schema: z.object({ title: z.string() }),
      messages: [{ role: "user", content: "Return arc JSON" }],
    });

    expect(client.generate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "model/planning" }),
    );
    expect(result.data.title).toBe("Arc 1");
  });
});
```

- [ ] **Step 2: Run the generation-service test to verify it fails**

Run: `npm run test -- tests/llm/generationService.test.ts`
Expected: FAIL because `src/llm/generationService.ts` does not exist yet.

- [ ] **Step 3: Implement the generation facade**

```ts
// src/llm/generationService.ts
import { getGenerationConfig } from "./generationConfig";
import { parseStructuredJson } from "./outputParsers/jsonParser";
import { parseMarkdown } from "./outputParsers/markdownParser";
import type { LlmConfig } from "../config/llmConfig";
import type { LlmStepId } from "./types";
import type { ZodType } from "zod";

interface GenerationServiceOptions {
  client: {
    generate: (input: {
      model: string;
      messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
      temperature?: number;
      max_tokens?: number;
    }) => Promise<{ content: string; raw: unknown }>;
  };
  models: LlmConfig["models"];
}

export function createGenerationService(options: GenerationServiceOptions) {
  function resolveModel(step: LlmStepId): string {
    const config = getGenerationConfig(step);
    return options.models[config.tier];
  }

  return {
    async generateMarkdown(input: {
      step: LlmStepId;
      messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
    }) {
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
      messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
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
```

- [ ] **Step 4: Run the generation-service test to verify it passes**

Run: `npm run test -- tests/llm/generationService.test.ts`
Expected: PASS

- [ ] **Step 5: Commit the generation service**

```bash
git add src/llm/generationService.ts tests/llm/generationService.test.ts
git commit -m "feat: add llm generation service"
```

### Task 6: Wire the provider layer into the workflow without migrating any step yet

**Files:**

- Modify: `src/workflow/runNovelProduction.ts`
- Modify: `tests/workflow/runNovelProduction.test.ts`

- [ ] **Step 1: Write the failing workflow injection test**

```ts
import { describe, expect, it, vi } from "vitest";
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validProductionInput } from "../fixtures/validProductionInput";
import { runNovelProduction } from "../../src/workflow/runNovelProduction";

describe("runNovelProduction", () => {
  it("accepts an injected generation service for later LLM-backed steps", async () => {
    const root = await mkdtemp(join(tmpdir(), "nova-workflow-"));
    const generationService = {
      generateMarkdown: vi.fn(),
      generateStructured: vi.fn(),
    };

    await runNovelProduction(validProductionInput, {
      outputsDir: root,
      generationService,
    });

    expect(generationService.generateMarkdown).not.toHaveBeenCalled();
    expect(generationService.generateStructured).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the workflow test to verify it fails**

Run: `npm run test -- tests/workflow/runNovelProduction.test.ts`
Expected: FAIL because the workflow options do not currently accept `generationService`.

- [ ] **Step 3: Extend workflow options and context to carry the future service**

```ts
// src/workflow/runNovelProduction.ts
interface RunNovelProductionOptions {
  outputsDir?: string;
  runId?: string;
  registry?: RunRegistry;
  fileStore?: FileStore;
  generationService?: {
    generateMarkdown: (...args: unknown[]) => Promise<unknown>;
    generateStructured: (...args: unknown[]) => Promise<unknown>;
  };
}
```

- [ ] **Step 4: Run the workflow test to verify it passes**

Run: `npm run test -- tests/workflow/runNovelProduction.test.ts`
Expected: PASS

- [ ] **Step 5: Commit the workflow integration seam**

```bash
git add src/workflow/runNovelProduction.ts tests/workflow/runNovelProduction.test.ts
git commit -m "refactor: add generation service workflow seam"
```

### Task 7: Migrate Tier 1 planning steps to the LLM generation service

**Files:**

- Modify: `src/steps/generateStoryBible.ts`
- Modify: `src/steps/generateWorldBible.ts`
- Modify: `src/steps/generateCharacterBible.ts`
- Modify: `src/steps/generateArcPlan.ts`
- Modify: `src/steps/generateChapterPlan.ts`
- Create: `tests/steps/generatePlanningSteps.test.ts`
- Modify: `src/workflow/runNovelProduction.ts`

- [ ] **Step 1: Write the failing Tier 1 migration test with a mocked generation service**

```ts
import { describe, expect, it, vi } from "vitest";
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validProductionInput } from "../fixtures/validProductionInput";
import { runNovelProduction } from "../../src/workflow/runNovelProduction";

describe("planning step migration", () => {
  it("uses the generation service for planning outputs", async () => {
    const root = await mkdtemp(join(tmpdir(), "nova-planning-"));
    const generationService = {
      generateMarkdown: vi
        .fn()
        .mockResolvedValueOnce({ content: "# Story Bible\\n\\nGenerated", raw: {} })
        .mockResolvedValueOnce({ content: "# World Bible\\n\\nGenerated", raw: {} })
        .mockResolvedValueOnce({ content: "# Character Bible\\n\\nGenerated", raw: {} }),
      generateStructured: vi
        .fn()
        .mockResolvedValueOnce({
          data: [
            {
              id: "arc-01",
              title: "Arc 1",
              startChapter: 1,
              endChapter: 1,
              premise: "Premise",
              mainConflict: "Conflict",
              keyReveals: ["Reveal"],
              emotionalProgression: "Progression",
              expectedEnding: "Ending",
            },
          ],
          raw: {},
        })
        .mockResolvedValueOnce({
          data: [
            {
              chapterNumber: 1,
              title: "Chapter 0001 - Arc 1",
              arcId: "arc-01",
              mainGoal: "Goal",
              mainConflict: "Conflict",
              requiredCharacters: ["protagonist"],
              requiredLocations: ["Ruined chapel"],
              emotionalBeat: "Beat",
              mysteryProgress: "Progress",
              romanceProgress: "Romance",
              endingHook: "Hook",
              videoFocus: "Focus",
            },
          ],
          raw: {},
        }),
    };

    await runNovelProduction(validProductionInput, {
      outputsDir: root,
      generationService,
    });

    expect(generationService.generateMarkdown).toHaveBeenCalled();
    expect(generationService.generateStructured).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the Tier 1 migration test to verify it fails**

Run: `npm run test -- tests/steps/generatePlanningSteps.test.ts`
Expected: FAIL because planning steps still generate deterministic text directly.

- [ ] **Step 3: Rewrite `generateStoryBible` to use markdown generation when a service is present**

```ts
export async function generateStoryBible(
  outputPath: string,
  input: ProductionInput,
  fileStore: FileStore = createFileStore(),
  generationService?: {
    generateMarkdown: (input: {
      step: "generate_story_bible";
      messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
    }) => Promise<{ content: string }>;
  },
): Promise<string> {
  const relativePath = "knowledge-base/story-bible.md";

  const content = generationService
    ? (
        await generationService.generateMarkdown({
          step: "generate_story_bible",
          messages: [
            { role: "system", content: "You are a novel planning model." },
            { role: "user", content: JSON.stringify(input.project) },
          ],
        })
      ).content
    : `# Story Bible\n\n...existing deterministic fallback...`;

  await fileStore.writeText(join(outputPath, relativePath), content);
  return relativePath;
}
```

- [ ] **Step 4: Apply the same migration pattern to the other Tier 1 steps**

```ts
// For structured steps:
const result = generationService
  ? await generationService.generateStructured({
      step: "generate_arc_plan",
      schema: LlmArcPlanSchema,
      messages,
    })
  : { data: deterministicArcs, raw: null };
```

- [ ] **Step 5: Update the workflow to pass the generation service into Tier 1 steps**

```ts
await recordStep("generate_story_bible", () =>
  generateStoryBible(outputPath, input, fileStore, options.generationService),
);
```

- [ ] **Step 6: Run the Tier 1 migration test to verify it passes**

Run: `npm run test -- tests/steps/generatePlanningSteps.test.ts`
Expected: PASS

- [ ] **Step 7: Run the workflow regression test**

Run: `npm run test -- tests/workflow/runNovelProduction.test.ts`
Expected: PASS with deterministic fallback still intact when no generation service is injected.

- [ ] **Step 8: Commit the Tier 1 migration**

```bash
git add src/steps/generateStoryBible.ts src/steps/generateWorldBible.ts src/steps/generateCharacterBible.ts src/steps/generateArcPlan.ts src/steps/generateChapterPlan.ts src/workflow/runNovelProduction.ts tests/steps/generatePlanningSteps.test.ts tests/workflow/runNovelProduction.test.ts
git commit -m "feat: migrate planning steps to llm generation"
```

### Task 8: Migrate Tier 2-Tier 5 content steps and finish verification

**Files:**

- Modify: `src/steps/generateChapterDraft.ts`
- Modify: `src/steps/reviseChapter.ts`
- Modify: `src/steps/splitChapterIntoScenes.ts`
- Modify: `src/steps/generateStoryboard.ts`
- Modify: `src/steps/generateImagePrompts.ts`
- Modify: `src/steps/generateVideoPrompts.ts`
- Modify: `src/steps/generateVoiceover.ts`
- Modify: `src/steps/generateSubtitles.ts`
- Modify: `src/workflow/runNovelProduction.ts`
- Modify: `README.md`
- Create: `tests/steps/generateContentSteps.test.ts`

- [ ] **Step 1: Write the failing migration test for Tier 2-Tier 5 steps**

```ts
import { describe, expect, it, vi } from "vitest";
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validProductionInput } from "../fixtures/validProductionInput";
import { runNovelProduction } from "../../src/workflow/runNovelProduction";

describe("content step migration", () => {
  it("uses markdown and structured generation across downstream steps", async () => {
    const root = await mkdtemp(join(tmpdir(), "nova-content-"));
    const generationService = {
      generateMarkdown: vi.fn().mockResolvedValue({ content: "# Generated", raw: {} }),
      generateStructured: vi.fn().mockResolvedValue({ data: [], raw: {} }),
    };

    await runNovelProduction(validProductionInput, {
      outputsDir: root,
      generationService,
    });

    expect(generationService.generateMarkdown).toHaveBeenCalled();
    expect(generationService.generateStructured).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the downstream migration test to verify it fails**

Run: `npm run test -- tests/steps/generateContentSteps.test.ts`
Expected: FAIL because the downstream steps still run deterministic implementations only.

- [ ] **Step 3: Migrate the long-form steps to markdown generation**

```ts
// src/steps/generateChapterDraft.ts
const content = generationService
  ? (
      await generationService.generateMarkdown({
        step: "generate_chapter_draft",
        messages,
      })
    ).content
  : deterministicContent;
```

- [ ] **Step 4: Migrate the scene and adaptation steps to structured generation**

```ts
// src/steps/splitChapterIntoScenes.ts
const result = generationService
  ? await generationService.generateStructured({
      step: "split_chapter_into_scenes",
      schema: LlmSceneBreakdownSchema,
      messages,
    })
  : { data: deterministicScenes, raw: null };
```

- [ ] **Step 5: Migrate subtitles and utility outputs**

```ts
// src/steps/generateSubtitles.ts
const result = generationService
  ? await generationService.generateStructured({
      step: "generate_subtitles",
      schema: LlmSubtitleSchema,
      messages,
    })
  : { data: deterministicSubtitles, raw: null };
```

- [ ] **Step 6: Update the README with OpenRouter env requirements**

```md
## Phase 2 Environment

To enable LLM-backed generation, set:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL_TIER_PLANNING`
- `OPENROUTER_MODEL_TIER_LONGFORM`
- `OPENROUTER_MODEL_TIER_SCENE`
- `OPENROUTER_MODEL_TIER_ADAPTATION`
- `OPENROUTER_MODEL_TIER_UTILITY`
```

- [ ] **Step 7: Run targeted LLM and workflow tests**

Run: `npm run test -- tests/config/env.test.ts tests/llm/modelTiers.test.ts tests/llm/openrouterClient.test.ts tests/llm/generationConfig.test.ts tests/llm/outputParsers.test.ts tests/llm/generationService.test.ts tests/steps/generatePlanningSteps.test.ts tests/steps/generateContentSteps.test.ts tests/workflow/runNovelProduction.test.ts`
Expected: PASS

- [ ] **Step 8: Run the full test suite**

Run: `npm run test`
Expected: PASS

- [ ] **Step 9: Run the production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 10: Commit the Phase 2 rollout completion**

```bash
git add src/steps src/workflow/runNovelProduction.ts README.md tests/steps/generateContentSteps.test.ts
git commit -m "feat: migrate content pipeline to openrouter tiers"
```

## Self-Review

- Spec coverage: the plan covers env parsing, tier routing, provider client, prompt/parser layer, generation service, workflow seam, rollout waves starting with Tier 1, and final migration across Tier 2-Tier 5.
- Placeholder scan: there are no `TODO`, `TBD`, or deferred “implement later” steps in the plan.
- Type consistency: the plan consistently uses `LlmStepId`, `LlmTier`, `GenerationConfig`, `createGenerationService`, and the injected `generationService` seam across all later tasks.
