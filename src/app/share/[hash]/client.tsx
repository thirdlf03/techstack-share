"use client";

import { deferredIconSvgs } from "@/data/tech-icons-deferred.generated";
import { registerDeferredIcons } from "@/lib/technology-icons";

// Ensure all icons are available before any component in this route renders.
registerDeferredIcons(deferredIconSvgs);

import { ShareCard } from "@/components/share-card";
import { Button } from "@/components/ui/button";
import type { TechStack } from "@/lib/encoder";
import Link from "next/link";

type SharePageClientProps = {
  hash: string;
  stack: TechStack;
  name?: string;
  avatarUrl?: string | null;
};

export function SharePageClient({ hash, stack, name, avatarUrl }: SharePageClientProps) {
  return (
    <>
      <ShareCard stack={stack} name={name} avatarUrl={avatarUrl} />
      <div className="flex gap-3 mt-6">
        <Link href={`/?restore=${hash}`} prefetch={false}>
          <Button variant="outline">このスタックを編集</Button>
        </Link>
      </div>
    </>
  );
}
