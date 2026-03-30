"use client";

import type { TechStack } from "@/lib/encoder";
import { groupTechStack } from "@/lib/share-card";
import { TechnologyIcon } from "./technology-icon";

type ShareCardProps = {
  stack: TechStack;
  name?: string;
  avatarUrl?: string | null;
};

export function ShareCard({ stack, name, avatarUrl }: ShareCardProps) {
  const grouped = groupTechStack(stack);

  return (
    <div className="space-y-6">
      {(name || avatarUrl) && (
        <div className="flex items-center gap-3">
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="size-10 rounded-full object-cover border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          {name && <span className="text-lg font-bold">{name}</span>}
        </div>
      )}
      {grouped.map((group) => (
        <section key={group.rating}>
          <h2 className="text-lg font-semibold mb-3 border-b pb-2 flex items-center gap-2">
            <span className="text-yellow-400">{"★".repeat(group.rating)}</span>
            <span className="text-muted-foreground text-sm">{group.label}</span>
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {group.techs.map((tech) => (
              <div
                key={tech.id}
                className="flex flex-col items-center gap-2 rounded-xl border border-primary bg-primary/5 p-3"
              >
                <TechnologyIcon className="size-8" techId={tech.id} />
                <span className="text-xs font-medium text-center">{tech.name}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
