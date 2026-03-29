import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarRating } from "./star-rating";

describe("StarRating", () => {
  it("should render 5 stars", () => {
    render(<StarRating value={0} onChange={() => {}} />);
    const stars = screen.getAllByRole("button");
    expect(stars).toHaveLength(5);
  });

  it("should highlight stars up to the current value", () => {
    render(<StarRating value={3} onChange={() => {}} />);
    const stars = screen.getAllByRole("button");
    expect(stars[0]).toHaveAttribute("data-filled", "true");
    expect(stars[1]).toHaveAttribute("data-filled", "true");
    expect(stars[2]).toHaveAttribute("data-filled", "true");
    expect(stars[3]).toHaveAttribute("data-filled", "false");
    expect(stars[4]).toHaveAttribute("data-filled", "false");
  });

  it("should call onChange with clicked star index", () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);
    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[2]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("should deselect when clicking the same value", () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} />);
    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[2]);
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("should be read-only when readOnly is true", () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} readOnly />);
    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[4]);
    expect(onChange).not.toHaveBeenCalled();
  });
});
