import { describe, expect, it } from "vitest";

describe("workspace scaffold", () => {
  it("loads the frontend app module", async () => {
    const module = await import("../../src/frontend/App");
    expect(module.App).toBeTypeOf("function");
  });
});
