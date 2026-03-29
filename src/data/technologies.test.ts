import { describe, it, expect } from "vitest";
import {
  technologies,
  CATEGORIES,
  getTechById,
  getTechsByCategory,
} from "./technologies";

describe("technologies data", () => {
  it("should have unique ids", () => {
    const ids = technologies.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should have valid categories", () => {
    for (const tech of technologies) {
      expect(CATEGORIES).toContain(tech.category);
    }
  });

  it("should have at least one tech per category", () => {
    for (const cat of CATEGORIES) {
      const techs = getTechsByCategory(cat);
      expect(techs.length).toBeGreaterThan(0);
    }
  });

  it("getTechById should return correct tech", () => {
    const aws = getTechById("aws");
    expect(aws).toBeDefined();
    expect(aws!.name).toBe("AWS");
  });

  it("getTechById should return undefined for unknown id", () => {
    expect(getTechById("nonexistent")).toBeUndefined();
  });

  it("all deviconClass should start with devicon-", () => {
    for (const tech of technologies) {
      expect(tech.deviconClass).toMatch(/^devicon-/);
    }
  });
});
