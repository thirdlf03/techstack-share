"use client";

import type { TechStack } from "@/lib/encoder";
import { getTechById } from "@/data/technologies";

type ShareCardProps = {
  stack: TechStack;
};

const RATING_LABELS: Record<number, string> = {
  5: "Expert",
  4: "Advanced",
  3: "Intermediate",
  2: "Beginner",
  1: "Learning",
};

export function ShareCard({ stack }: ShareCardProps) {
  // ★の数でグループ化（5→1の降順）
  const grouped = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    label: RATING_LABELS[rating],
    techs: Object.entries(stack)
      .filter(([, r]) => r === rating)
      .map(([id]) => getTechById(id))
      .filter(Boolean),
  })).filter((g) => g.techs.length > 0);

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <section key={group.rating}>
          <h2 className="text-lg font-semibold mb-3 border-b pb-2 flex items-center gap-2">
            <span className="text-yellow-400">{"★".repeat(group.rating)}</span>
            <span className="text-muted-foreground text-sm">{group.label}</span>
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {group.techs.map((tech) => (
              <div
                key={tech!.id}
                className="flex flex-col items-center gap-2 rounded-xl border border-primary bg-primary/5 p-3"
              >
                <i className={`${tech!.deviconClass} colored text-3xl`} />
                <span className="text-xs font-medium text-center">
                  {tech!.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
