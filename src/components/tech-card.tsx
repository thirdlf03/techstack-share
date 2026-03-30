"use client";

import { memo, useCallback } from "react";
import type { Technology } from "@/data/technologies";
import { StarRating } from "./star-rating";
import { TechnologyIcon } from "./technology-icon";

type TechCardProps = {
  onRatingChange: (techId: string, rating: number) => void;
  readOnly?: boolean;
  rating: number;
  tech: Technology;
};

function TechCardComponent({ tech, rating, onRatingChange, readOnly = false }: TechCardProps) {
  const isSelected = rating > 0;
  const handleRatingChange = useCallback(
    (nextRating: number) => {
      onRatingChange(tech.id, nextRating);
    },
    [onRatingChange, tech.id],
  );

  return (
    <div
      data-selected={isSelected ? "true" : "false"}
      className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/50"
      }`}
    >
      <TechnologyIcon className="size-8" dataTestId="tech-icon" techId={tech.id} />
      <span className="text-xs font-medium text-center">{tech.name}</span>
      <StarRating value={rating} onChange={handleRatingChange} readOnly={readOnly} />
    </div>
  );
}

export const TechCard = memo(TechCardComponent);
