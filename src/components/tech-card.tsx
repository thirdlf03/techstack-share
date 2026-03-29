"use client";

import type { Technology } from "@/data/technologies";
import { StarRating } from "./star-rating";

type TechCardProps = {
  tech: Technology;
  rating: number;
  onRatingChange: (rating: number) => void;
  readOnly?: boolean;
};

export function TechCard({ tech, rating, onRatingChange, readOnly = false }: TechCardProps) {
  const isSelected = rating > 0;

  return (
    <div
      data-selected={isSelected ? "true" : "false"}
      className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/50"
      }`}
    >
      <i
        data-testid="tech-icon"
        className={`${tech.deviconClass} colored text-3xl`}
      />
      <span className="text-xs font-medium text-center">{tech.name}</span>
      <StarRating value={rating} onChange={onRatingChange} readOnly={readOnly} />
    </div>
  );
}
