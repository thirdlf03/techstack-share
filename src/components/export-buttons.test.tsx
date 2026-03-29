import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExportButtons } from "./export-buttons";

vi.mock("html-to-image", () => ({
  toPng: vi.fn(() => Promise.resolve("data:image/png;base64,mock")),
}));

Object.assign(navigator, {
  clipboard: { writeText: vi.fn(() => Promise.resolve()) },
});

describe("ExportButtons", () => {
  it("should render share link button", () => {
    render(<ExportButtons stack={{ aws: 3 }} targetRef={{ current: null }} />);
    expect(screen.getByText("共有リンクをコピー")).toBeInTheDocument();
  });

  it("should render image export button", () => {
    render(<ExportButtons stack={{ aws: 3 }} targetRef={{ current: null }} />);
    expect(screen.getByText("画像で保存")).toBeInTheDocument();
  });

  it("should disable buttons when stack is empty", () => {
    render(<ExportButtons stack={{}} targetRef={{ current: null }} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
