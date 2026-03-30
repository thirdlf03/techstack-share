import { getTechById, type Technology } from "@/data/technologies";
import type { TechStack } from "@/lib/encoder";

export const RATING_VALUES = [5, 4, 3, 2, 1] as const;

export const RATING_LABELS: Record<(typeof RATING_VALUES)[number], string> = {
  5: "Expert",
  4: "Advanced",
  3: "Intermediate",
  2: "Beginner",
  1: "Learning",
};

export type GroupedTechStack = {
  label: string;
  rating: (typeof RATING_VALUES)[number];
  techs: Technology[];
};

export function groupTechStack(stack: TechStack): GroupedTechStack[] {
  return RATING_VALUES.map((rating) => ({
    rating,
    label: RATING_LABELS[rating],
    techs: Object.entries(stack)
      .filter(([, selectedRating]) => selectedRating === rating)
      .map(([id]) => getTechById(id))
      .filter((tech): tech is Technology => Boolean(tech)),
  })).filter((group) => group.techs.length > 0);
}
