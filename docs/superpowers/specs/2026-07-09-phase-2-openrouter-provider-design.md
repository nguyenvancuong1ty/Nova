# Nova Phase 2 OpenRouter Provider-First Design

## Goal

Build Phase 2 as a provider-first LLM generation architecture on top of the existing Phase 1 workflow. The system must replace deterministic text-generation behavior with OpenRouter-backed model execution while preserving the current workflow shape, run tracking, file outputs, and validation mindset.

Phase 2 should be designed to support:

- Multiple models by role
- Easy model replacement without rewriting workflow logic
- Structured output validation for JSON-heavy steps
- Long-form markdown generation for novel-writing steps
- Controlled rollout from upstream planning steps to downstream adaptation steps

## Product Direction

Phase 2 is not a general “AI integration” pass. It is specifically a production architecture for turning the current deterministic novel engine into a real LLM-backed content generation pipeline.

The priority is:

1. Clean provider layer
2. Stable model routing by tier
3. Output contracts and validation
4. Safe migration of workflow steps

This phase should optimize for long-term maintainability over fastest initial delivery.

## Constraints

- Use OpenRouter as the provider entrypoint
- Support multiple models by role from day one
- Keep the current `runNovelProduction()` orchestration as the outer workflow shell
- Do not mix provider details directly into workflow steps
- Preserve filesystem outputs and current output folder conventions
- Keep Phase 1 deterministic path available during rollout where useful for fallback or comparison

## Architecture Overview

Phase 2 introduces a new LLM subsystem under `src/llm/` and a configuration layer under `src/config/`.

The workflow steps in `src/steps/` should become consumers of a generation service rather than hand-building deterministic text directly.

### Core layers

#### 1. Provider Client Layer

Owns direct OpenRouter HTTP communication.

Responsibilities:

- Read API key and provider configuration
- Construct request payloads
- Send chat completion requests
- Normalize provider errors
- Apply timeout and retry policy at the transport level
- Return raw model responses plus metadata needed for logging

This layer must not know business concepts like “arc plan” or “chapter draft”.

#### 2. Model Tier Layer

Owns the five-tier model strategy.

Responsibilities:

- Define the canonical tier ids
- Map each tier to a configurable OpenRouter model id
- Expose a resolver so generation steps ask for a tier, not a model string

The five tiers are:

- `tier_planning`
- `tier_longform`
- `tier_scene`
- `tier_adaptation`
- `tier_utility`

#### 3. Generation Config Layer

Owns step-level generation behavior.

Responsibilities:

- Map workflow step name to tier
- Define prompt mode per step
- Define temperature, token budget, and output format expectations
- Define retry and repair strategy for malformed output

This layer is the bridge between workflow steps and model routing.

#### 4. Prompt Template Layer

Owns reusable prompt construction.

Responsibilities:

- System prompts by role
- User prompt builders by step
- Shared constraints for style, continuity, language, format, and schema adherence
- Separation between long-form writing prompts and structured JSON prompts

Prompt templates should not live inline in workflow step files except for very small adapters.

#### 5. Output Parsing and Validation Layer

Owns structured output handling.

Responsibilities:

- Parse markdown outputs as plain text when the contract is freeform
- Parse JSON object and JSON array outputs for structured steps
- Validate structured outputs with Zod schemas
- Trigger repair/retry flow when output is malformed or schema-invalid
- Expose normalized typed results back to workflow steps

This layer is critical because many downstream steps depend on machine-readable outputs.

#### 6. Generation Service Layer

Owns the internal API that workflow steps use.

Responsibilities:

- Accept a step identifier and typed input
- Resolve config, tier, model, prompt, and parser
- Call the provider client
- Validate or repair output
- Return typed results plus optional generation metadata

Workflow steps should depend on this layer instead of calling OpenRouter directly.

## File and Module Boundaries

Expected new module groups:

- `src/config/env.ts`
- `src/config/llmConfig.ts`
- `src/llm/openrouterClient.ts`
- `src/llm/modelTiers.ts`
- `src/llm/generationConfig.ts`
- `src/llm/generationService.ts`
- `src/llm/promptTemplates/`
- `src/llm/outputParsers/`
- `src/llm/schemas/`
- `src/llm/types.ts`

Existing workflow files remain in place:

- `src/workflow/runNovelProduction.ts`
- `src/steps/*.ts`

The migration should adapt step implementations, not replace the whole workflow architecture.

## Environment and Configuration

Minimum environment configuration:

- `OPENROUTER_API_KEY`

Expected configurable values:

- `OPENROUTER_BASE_URL` optional override
- `OPENROUTER_APP_NAME` optional metadata
- `OPENROUTER_APP_URL` optional metadata
- one model id per tier:
  - `OPENROUTER_MODEL_TIER_PLANNING`
  - `OPENROUTER_MODEL_TIER_LONGFORM`
  - `OPENROUTER_MODEL_TIER_SCENE`
  - `OPENROUTER_MODEL_TIER_ADAPTATION`
  - `OPENROUTER_MODEL_TIER_UTILITY`

Optional tuning values may later be added, but the initial architecture should avoid an excessive env surface.

## Tier Design

### Tier 1: Planning

Purpose:

- Story bible
- World bible
- Character bible
- Arc plan
- Chapter plan

Requirements:

- Strong reasoning across broad context
- Good structure adherence
- Consistency over many constraints

### Tier 2: Long-form Writing

Purpose:

- Chapter draft generation
- Chapter revision
- Chapter final rewrite pass

Requirements:

- Long coherent prose
- Better scene-to-scene flow
- Tone and voice retention
- Ability to revise from critique input

### Tier 3: Scene Structuring

Purpose:

- Scene breakdown generation
- Storyboard text generation

Requirements:

- Strong structural discipline
- Good conversion from chapter text into beat-level units
- Reliable JSON or outline formatting

### Tier 4: Adaptation

Purpose:

- Image prompts
- Video prompts
- Voiceover scripts

Requirements:

- Good instruction following
- Strong descriptive output
- Consistent transformation from source scenes

### Tier 5: Utility

Purpose:

- Subtitle generation
- Output cleanup
- Format repair
- Small consistency fix passes

Requirements:

- Cheap and reliable formatting work
- Good short-form normalization

## Workflow Step Mapping

The current workflow should be migrated by mapping each step to one tier.

### Tier 1 steps

- `generateStoryBible`
- `generateWorldBible`
- `generateCharacterBible`
- `generateArcPlan`
- `generateChapterPlan`

### Tier 2 steps

- `generateChapterDraft`
- `reviseChapter`

### Tier 3 steps

- `splitChapterIntoScenes`
- `generateStoryboard`

### Tier 4 steps

- `generateImagePrompts`
- `generateVideoPrompts`
- `generateVoiceover`

### Tier 5 steps

- `generateSubtitles`
- repair passes for malformed JSON or markdown cleanup

Steps such as validation, folder creation, export, timeline updates, and final summary remain non-LLM orchestration logic.

## Output Modes

There are two primary output classes.

### 1. Freeform markdown/text

Used for:

- story bible
- world bible
- character bible summary
- chapter draft
- revised chapter
- storyboard markdown
- voiceover script

Handling:

- raw text return
- minimal normalization
- post-write validation where useful

### 2. Structured JSON

Used for:

- arc plan
- chapter plan
- scene breakdown
- image prompts
- video prompts
- subtitles when stored in machine-readable segments

Handling:

- explicit schema prompt instructions
- JSON extraction
- Zod validation
- repair/retry loop on malformed output

## Prompt Strategy

Prompt design should be role-based, not file-based.

Prompt families:

- `planning`
- `longform`
- `scene_structuring`
- `adaptation`
- `utility`

Each family should provide:

- system framing
- step-specific prompt builder
- formatting rules
- hard constraints

Prompt builders should accept typed input, not unstructured string blobs whenever possible.

## Error Handling

Phase 2 needs explicit error policy because provider-backed generation is much less deterministic than Phase 1.

Error categories:

- transport failure
- provider rejection
- timeout
- empty response
- malformed JSON
- schema validation failure
- content that is syntactically valid but structurally incomplete

Required behavior:

- retry transport failures with bounded attempts
- repair or retry malformed structured output
- fail the workflow step with a useful error if output cannot be normalized
- record enough metadata for debugging in run logs

The system should not silently accept malformed structured output.

## Logging and Observability

Generation metadata should be visible enough to debug, but not so noisy that logs become unusable.

At minimum the system should capture:

- step name
- tier used
- model id used
- attempt count
- output parsing/repair events
- error reason on failure

This metadata should flow into existing run logs in a concise form.

Optional token accounting can be added later if the chosen OpenRouter response shape supports it reliably.

## Rollout Strategy

The migration should happen in ordered waves.

### Wave 1: Provider foundation only

Build:

- env parsing
- OpenRouter client
- tier resolver
- generation config
- prompt/template system
- output parser layer
- generation service

No workflow step is replaced yet.

### Wave 2: Planning migration

Replace Tier 1 steps first.

Reason:

- downstream steps depend on these outputs
- these steps establish story consistency and long-range structure

### Wave 3: Long-form writing migration

Replace:

- `generateChapterDraft`
- `reviseChapter`

Reason:

- this is where real novel value begins
- output quality here materially changes the whole product

### Wave 4: Scene and storyboard migration

Replace:

- `splitChapterIntoScenes`
- `generateStoryboard`

Reason:

- scenes should be derived from real chapter prose, not placeholder chapter structures

### Wave 5: Adaptation migration

Replace:

- `generateImagePrompts`
- `generateVideoPrompts`
- `generateVoiceover`

### Wave 6: Utility migration

Replace or augment:

- `generateSubtitles`
- cleanup and repair helpers

## Fallback Strategy

During migration, deterministic behavior may remain available behind configuration or side-by-side step implementations.

Purpose:

- make rollout incremental
- allow comparison between deterministic and LLM-backed outputs
- reduce the blast radius when one tier is unstable

The long-term target is a fully LLM-backed content pipeline, but the architecture should allow temporary fallback while phases are being validated.

## Testing Strategy

Phase 2 needs stronger contract testing than Phase 1.

Required test classes:

- env/config tests
- model tier resolution tests
- generation config mapping tests
- prompt builder tests
- parser and schema validation tests
- repair/retry behavior tests
- step-level integration tests with mocked OpenRouter responses
- end-to-end workflow tests using mock provider outputs

Tests must not depend on live OpenRouter calls in CI or default local test runs.

## Non-Goals

This spec does not include:

- real image generation provider integration
- real image-to-video provider integration
- model selection UI
- token cost dashboard
- prompt editing UI
- persistent generation history beyond current run/output structures

Those can follow after the provider-first content pipeline is stable.

## Risks and Controls

### Risk: provider layer becomes over-abstracted

Control:

- keep abstractions tied to actual workflow needs
- avoid generic multi-provider frameworks before needed

### Risk: structured outputs are too brittle

Control:

- use explicit Zod schemas
- add repair/retry behavior
- start migration with planner outputs before downstream prompt outputs

### Risk: long-form generation becomes expensive or inconsistent

Control:

- isolate the long-form tier
- keep prompts and config per step
- support model swaps without workflow rewrites

### Risk: workflow logs become too sparse to debug failures

Control:

- log step, tier, model, attempt, and parser outcome in concise form

### Risk: migration touches too much code at once

Control:

- rollout in waves
- keep deterministic path temporarily available during transition

## Acceptance Criteria

Phase 2 provider architecture is ready when:

- OpenRouter credentials and model tiers are configurable from env
- A single generation service can execute prompts through tier-based routing
- Structured outputs can be parsed and validated through a shared mechanism
- The workflow can migrate step-by-step without rewriting orchestration
- Tests can mock provider behavior without network dependency
- The design supports all five model tiers without hardcoding models inside workflow steps
