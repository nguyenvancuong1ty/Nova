import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../../src/frontend/App";

describe("App", () => {
  it("renders the production setup form and start button", () => {
    render(<App />);
    expect(screen.getByLabelText(/project title/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /start production/i }),
    ).toBeInTheDocument();
  });
});
