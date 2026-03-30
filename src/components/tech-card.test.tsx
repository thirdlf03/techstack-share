import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TechCard } from "./tech-card";

const mockTech = {
  id: "react",
  name: "React",
  deviconClass: "devicon-react-plain",
  category: "frontend" as const,
};

describe("TechCard", () => {
  it("should render technology name", () => {
    render(<TechCard tech={mockTech} rating={0} onRatingChange={() => {}} />);
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("should render devicon", () => {
    render(<TechCard tech={mockTech} rating={0} onRatingChange={() => {}} />);
    const icon = screen.getByTestId("tech-icon");
    expect(icon).toHaveAttribute("src");
    expect(icon.getAttribute("src")).toContain("data:image/svg+xml");
  });

  it("should show star rating when rating > 0", () => {
    render(<TechCard tech={mockTech} rating={3} onRatingChange={() => {}} />);
    const filledStars = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("data-filled") === "true");
    expect(filledStars).toHaveLength(3);
  });

  it("should have selected style when rating > 0", () => {
    const { container } = render(<TechCard tech={mockTech} rating={3} onRatingChange={() => {}} />);
    expect(container.firstChild).toHaveAttribute("data-selected", "true");
  });

  it("should have unselected style when rating is 0", () => {
    const { container } = render(<TechCard tech={mockTech} rating={0} onRatingChange={() => {}} />);
    expect(container.firstChild).toHaveAttribute("data-selected", "false");
  });
});
