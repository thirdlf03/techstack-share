"use client";

import { CATEGORIES, CATEGORY_LABELS, getTechsByCategory } from "@/data/technologies";
import { TechCard } from "./tech-card";
import type { TechStack } from "@/lib/encoder";

type TechGridProps = {
  stack: TechStack;
  onStackChange: (stack: TechStack) => void;
  searchQuery: string;
  readOnly?: boolean;
};

export function TechGrid({ stack, onStackChange, searchQuery, readOnly = false }: TechGridProps) {
  const query = searchQuery.toLowerCase();

  return (
    <div className="space-y-8">
      {CATEGORIES.map((category) => {
        const techs = getTechsByCategory(category).filter((t) =>
          t.name.toLowerCase().includes(query)
        );

        if (techs.length === 0) return null;

        return (
          <section key={category}>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {techs.map((tech) => (
                <TechCard
                  key={tech.id}
                  tech={tech}
                  rating={stack[tech.id] ?? 0}
                  onRatingChange={(rating) => {
                    const next = { ...stack };
                    if (rating === 0) {
                      delete next[tech.id];
                    } else {
                      next[tech.id] = rating;
                    }
                    onStackChange(next);
                  }}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
