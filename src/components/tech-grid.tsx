"use client";

import { memo, useEffect, useMemo } from "react";
import { CATEGORIES, CATEGORY_LABELS, getTechsByCategory } from "@/data/technologies";
import type { TechStack } from "@/lib/encoder";
import { preloadDeferredIcons } from "@/lib/technology-icons";
import { LazyCategory } from "./lazy-category";
import { TechCard } from "./tech-card";

/** Categories rendered eagerly (above the fold). */
const EAGER_CATEGORIES = new Set(["language", "frontend"]);

type TechGridProps = {
  onRatingChange: (techId: string, rating: number) => void;
  readOnly?: boolean;
  searchQuery: string;
  stack: TechStack;
};

function TechGridComponent({
  stack,
  onRatingChange,
  searchQuery,
  readOnly = false,
}: TechGridProps) {
  // Start loading deferred icons as soon as the grid mounts.
  useEffect(() => {
    preloadDeferredIcons();
  }, []);

  const visibleCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return CATEGORIES.map((category) => ({
      category,
      techs: getTechsByCategory(category).filter((tech) => tech.name.toLowerCase().includes(query)),
    })).filter((entry) => entry.techs.length > 0);
  }, [searchQuery]);

  return (
    <div className="space-y-8">
      {visibleCategories.map(({ category, techs }) => {
        const content = (
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
                  onRatingChange={onRatingChange}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </section>
        );

        if (EAGER_CATEGORIES.has(category)) {
          return <div key={category}>{content}</div>;
        }

        return <LazyCategory key={category}>{content}</LazyCategory>;
      })}
    </div>
  );
}

export const TechGrid = memo(TechGridComponent);
