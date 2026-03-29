import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TechGrid } from "./tech-grid";

describe("TechGrid", () => {
  it("should render category headers", () => {
    render(<TechGrid stack={{}} onStackChange={() => {}} searchQuery="" />);
    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByText("Frontend")).toBeInTheDocument();
    expect(screen.getByText("Backend")).toBeInTheDocument();
  });

  it("should filter technologies by search query", () => {
    render(
      <TechGrid stack={{}} onStackChange={() => {}} searchQuery="React" />
    );
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.queryByText("JavaScript")).not.toBeInTheDocument();
  });

  it("should hide empty categories when filtered", () => {
    render(
      <TechGrid stack={{}} onStackChange={() => {}} searchQuery="React" />
    );
    expect(screen.queryByText("Database")).not.toBeInTheDocument();
  });
});
