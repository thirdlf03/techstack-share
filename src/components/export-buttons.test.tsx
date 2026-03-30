import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExportButtons } from "./export-buttons";

Object.assign(navigator, {
  clipboard: { writeText: vi.fn(() => Promise.resolve()) },
});

describe("ExportButtons", () => {
  it("should render share link button", () => {
    render(<ExportButtons stack={{ aws: 3 }} />);
    expect(screen.getByText("共有リンクをコピー")).toBeInTheDocument();
  });

  it("should render image export button", () => {
    render(<ExportButtons stack={{ aws: 3 }} />);
    expect(screen.getByText("画像で保存")).toBeInTheDocument();
  });

  it("should disable buttons when stack is empty", () => {
    render(<ExportButtons stack={{}} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
