import express, { type Express } from "express";
import { join } from "node:path";
import { ensureEnvFilesLoaded } from "../config/loadEnvFiles";
import { createRuntimeGenerationService } from "../llm/createRuntimeGenerationService";
import { RunRegistry } from "../services/runRegistry";
import { createProductionRouter } from "./routes/production.routes";

interface CreateServerOptions {
  outputsDir?: string;
}

export function createServer(options: CreateServerOptions = {}): Express {
  ensureEnvFilesLoaded();
  const app = express();
  const registry = new RunRegistry();
  const generationService = createRuntimeGenerationService();

  app.use(express.json({ limit: "2mb" }));
  app.use(
    "/api/production",
    createProductionRouter({
      outputsDir: options.outputsDir,
      registry,
      generationService,
    }),
  );

  return app;
}

const isExecutedDirectly =
  process.argv[1] && import.meta.url.endsWith(process.argv[1]);

if (isExecutedDirectly) {
  const port = Number(process.env.PORT ?? 3000);
  const app = createServer({ outputsDir: join(process.cwd(), "outputs") });
  app.listen(port, () => {
    console.log(`Nova server listening on http://localhost:${port}`);
  });
}
