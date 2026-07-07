import request from "supertest";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/app/server";
import { validProductionInput } from "../fixtures/validProductionInput";

describe("production routes", () => {
  it("starts a workflow and exposes status endpoints", async () => {
    const app = createServer();
    const start = await request(app)
      .post("/api/production/start")
      .send(validProductionInput);

    expect(start.status).toBe(202);
    expect(start.body.status).toBe("started");

    const status = await request(app).get(
      `/api/production/status/${start.body.runId}`,
    );
    expect(status.status).toBe(200);
    expect(status.body.runId).toBe(start.body.runId);
  });
});
