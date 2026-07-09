import type { GenerationService } from "../../llm/generationService";
import { Router } from "express";
import type { RunRegistry } from "../../services/runRegistry";
import { slugifyTitle } from "../../services/slugService";
import { runNovelProduction } from "../../workflow/runNovelProduction";
import type { RunState } from "../../types";

interface ProductionRoutesOptions {
  outputsDir?: string;
  registry: RunRegistry;
  generationService?: GenerationService;
}

export function createProductionRouter(
  options: ProductionRoutesOptions,
): Router {
  const router = Router();

  router.post("/start", async (req, res) => {
    const runId = `run_${Date.now()}`;
    const initialState: RunState = {
      runId,
      projectSlug: req.body?.project?.title ?? "pending",
      status: "running",
      currentStep: "queued",
      totalChapters: req.body?.chapterConfig?.totalChapters ?? 0,
      progressPercent: 0,
      startedAt: new Date().toISOString(),
      outputPath: "",
      logs: ["Workflow queued"],
    };
    options.registry.set(initialState);

    void runNovelProduction(req.body, {
      outputsDir: options.outputsDir,
      runId,
      registry: options.registry,
      generationService: options.generationService,
    }).catch(() => {
      // Errors are persisted by the workflow tracker and surfaced via status polling.
    });

    res.status(202).json({
      runId,
      projectSlug: slugifyTitle(req.body?.project?.title ?? "pending"),
      status: "started",
    });
  });

  router.get("/status/:runId", (req, res) => {
    const state = options.registry.get(req.params.runId);
    if (!state) {
      return res.status(404).json({ error: "Run not found" });
    }

    return res.json(state);
  });

  router.get("/result/:runId", (req, res) => {
    const state = options.registry.get(req.params.runId);
    if (!state) {
      return res.status(404).json({ error: "Run not found" });
    }

    return res.json({
      runId: state.runId,
      status: state.status,
      outputPath: state.outputPath,
      generatedFiles: options.registry.getGeneratedFiles(req.params.runId),
    });
  });

  router.post("/cancel/:runId", (req, res) => {
    options.registry.cancel(req.params.runId);
    return res.status(202).json({
      runId: req.params.runId,
      status: "cancelled",
    });
  });

  return router;
}
