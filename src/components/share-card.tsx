"use client";

import type { TechStack } from "@/lib/encoder";
import { CATEGORIES, CATEGORY_LABELS, getTechsByCategory } from "@/data/technologies";
import { StarRating } from "./star-rating";

type ShareCardProps = {
  stack: TechStack;
};

export function ShareCard({ stack }: ShareCardProps) {
  const selectedIds = Object.keys(stack);

  return (
    <div className="space-y-6">
      {CATEGORIES.map((category) => {
        const techs = getTechsByCategory(category).filter((t) =>
          selectedIds.includes(t.id)
        );

        if (techs.length === 0) return null;

        return (
          <section key={category}>
            <h2 className="text-lg font-semibold mb-3 border-b pb-2">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {techs.map((tech) => (
                <div
                  key={tech.id}
                  className="flex flex-col items-center gap-2 rounded-xl border border-primary bg-primary/5 p-3"
                >
                  <i className={`${tech.deviconClass} colored text-3xl`} />
                  <span className="text-xs font-medium text-center">
                    {tech.name}
                  </span>
                  <StarRating
                    value={stack[tech.id]}
                    onChange={() => {}}
                    readOnly
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
