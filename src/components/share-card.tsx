"use client";

import type { TechStack } from "@/lib/encoder";
import { groupTechStack } from "@/lib/share-card";
import { TechnologyIcon } from "./technology-icon";

type ShareCardProps = {
  stack: TechStack;
  name?: string;
  avatarUrl?: string | null;
  githubId?: string;
  linkable?: boolean;
};

export function ShareCard({ stack, name, avatarUrl, githubId, linkable }: ShareCardProps) {
  const grouped = groupTechStack(stack);

  return (
    <div className="space-y-6">
      {(name || avatarUrl || githubId) && (
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
          <div className="flex flex-col">
            {name && <span className="text-lg font-bold">{name}</span>}
            {githubId && (
              <a
                href={`https://github.com/${githubId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                {githubId}
              </a>
            )}
          </div>
        </div>
      )}
      {grouped.map((group) => (
        <section key={group.rating}>
          <h2 className="text-lg font-semibold mb-3 border-b pb-2 flex items-center gap-2">
            <span className="text-yellow-400">{"★".repeat(group.rating)}</span>
            <span className="text-muted-foreground text-sm">{group.label}</span>
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {group.techs.map((tech) => {
              const content = (
                <>
                  <TechnologyIcon className="size-8" techId={tech.id} />
                  <span className="text-xs font-medium text-center">{tech.name}</span>
                </>
              );
              const className = "flex flex-col items-center gap-2 rounded-xl border border-primary bg-primary/5 p-3";
              return linkable ? (
                <a
                  key={tech.id}
                  href={tech.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${className} hover:bg-primary/10 transition-colors`}
                >
                  {content}
                </a>
              ) : (
                <div key={tech.id} className={className}>
                  {content}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
