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
3. Fill the production form.
4. Add or edit characters as needed.
5. Click `Start Production`.
6. Watch status, step, chapter progress, and logs update in the UI.

Vite proxies `/api` requests to the Express server on `http://localhost:3000` during development.

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
