# Nova Phase 1

Nova Phase 1 is a private local workflow app for turning novel production input into a deterministic script-production package for long-form webnovel or light novel adaptation work.

Phase 1 does not generate real images or videos.
It generates the production package required for image and video generation.

## Phase 1 Scope

The app provides:

- Local React web UI
- Express API for starting and tracking runs
- Deterministic end-to-end workflow execution
- Filesystem output package generation
- Progress tracking, logs, and run-state persistence
- Unit and integration tests for core services, workflow, API, and UI

The app does not provide:

- External AI model calls
- Image or video rendering
- Voice synthesis
- Database storage
- Multi-user auth
- Cloud deployment

## What It Generates

For each run, Nova writes:

- Story bible
- World bible
- Character bible
- Visual reference bible
- Arc plan
- Chapter plan
- Chapter drafts and finals
- Scene breakdowns
- Continuity reports
- Storyboards
- Image prompts
- Video prompts
- Voiceover scripts
- Subtitle drafts
- Export bundle and summary files

## Installation

```bash
npm install
```

## Development Commands

```bash
npm run dev
npm run dev:server
npm run dev:web
npm run test
npm run build
npm run lint
npm run format
```

## Running The Local UI

1. Start the server and frontend together:

```bash
npm run dev
```

2. Open the Vite local URL shown in the terminal, usually `http://localhost:5173`.
3. Use the top summary band to confirm the current run context.
4. Configure the project from the left workspace panel using the `Dự án`, `Cốt truyện`, `Nhân vật`, and `Video` tabs.
5. Click `Bắt đầu sản xuất`.
6. Watch status, step, chapter progress, logs, and output path update in the right monitoring column.

Vite proxies `/api` requests to the Express server on `http://localhost:3000` during development.

## Phase 2 Environment

To enable OpenRouter-backed generation, set:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL_TIER_PLANNING`
- `OPENROUTER_MODEL_TIER_LONGFORM`
- `OPENROUTER_MODEL_TIER_SCENE`
- `OPENROUTER_MODEL_TIER_ADAPTATION`
- `OPENROUTER_MODEL_TIER_UTILITY`

Optional:

- `OPENROUTER_BASE_URL`
- `OPENROUTER_APP_NAME`
- `OPENROUTER_APP_URL`

## Excel Import

The workspace supports strict Excel import from one sheet with one data row.

- Use the first sheet only
- Provide exactly one populated row
- Use `|` for flat list fields such as `genres`, `important_themes`, and locations
- Put all characters in the `characters_json` column as a JSON array
- Use the `Tải file mẫu` action in the UI to download a valid workbook template

## Output Folder

Generated runs are written under:

```text
outputs/<project-slug>/
```

Key folders:

- `input/` stores the original production input JSON
- `knowledge-base/` stores story, world, character, and timeline artifacts
- `planning/` stores arc and chapter planning files
- `chapters/` stores all chapter-level files
- `exports/` stores full-package combined outputs
- `logs/` stores `run.log`
- `run-state.json` tracks workflow progress

## Architecture Overview

- `src/frontend/` contains the local web UI and polling progress panels.
- `src/app/` contains the Express API routes and server bootstrap.
- `src/workflow/` contains the orchestration and progress tracker.
- `src/steps/` contains one deterministic generator module per workflow step.
- `src/services/` contains filesystem, slug, templating, logging, and registry utilities.
- `src/schemas/` and `src/types/` define shared contracts for validation and runtime coordination.

## How Production Workflow Runs

The workflow validates input, creates a project folder, writes input files, generates knowledge-base artifacts, creates planning files, loops through every chapter, writes per-chapter assets, updates timeline state, exports combined deliverables, and writes final summaries.

## Future Phases

Potential next steps after Phase 1:

- Replace deterministic placeholders with real AI generation
- Connect image generation and image-to-video providers
- Add richer editing and rerun controls
- Improve output browsing and local asset preview
# Nova
