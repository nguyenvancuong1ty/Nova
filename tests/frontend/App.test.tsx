import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../../src/frontend/App";

describe("App", () => {
  it("renders the Vietnamese studio dashboard shell", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /bảng điều khiển sản xuất tiểu thuyết sang gói video/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /bắt đầu sản xuất/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/thiết lập cốt lõi/i)).toBeInTheDocument();
    expect(
      screen.getByText(/chưa có run nào được bắt đầu/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /dự án/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /cốt truyện/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /nhân vật/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /video/i })).toBeInTheDocument();
    expect(screen.getByText(/log trực tiếp/i)).toBeInTheDocument();
    expect(screen.getByText(/đầu ra hiện tại/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /import excel/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /tải file mẫu/i }),
    ).toBeInTheDocument();
  });
});
