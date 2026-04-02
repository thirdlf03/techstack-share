"use client";

import { deferredIconSvgs } from "@/data/tech-icons-deferred.generated";
import { registerDeferredIcons } from "@/lib/technology-icons";

// Ensure all icons are available before any component in this route renders.
registerDeferredIcons(deferredIconSvgs);

import { useState } from "react";
import { ShareCard } from "@/components/share-card";
import { Button } from "@/components/ui/button";
import type { TechStack } from "@/lib/encoder";
import { generateTechStackMarkdown } from "@/lib/tech-stack-markdown";
import Link from "next/link";

type SharePageClientProps = {
  hash: string;
  stack: TechStack;
  name?: string;
  avatarUrl?: string | null;
  githubId?: string;
};

export function SharePageClient({ hash, stack, name, avatarUrl, githubId }: SharePageClientProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    const md = generateTechStackMarkdown(stack, { name, githubId });
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <ShareCard stack={stack} name={name} avatarUrl={avatarUrl} githubId={githubId} linkable />
      <div className="flex flex-wrap gap-3 mt-6">
        <Link href={`/?restore=${hash}`} prefetch={false}>
          <Button variant="outline">このスタックを編集</Button>
        </Link>
        <Button variant="outline" onClick={handleCopyMarkdown}>
          {copied ? "コピーしました!" : "Markdownでコピー"}
        </Button>
        <Link href="/" prefetch={false}>
          <Button>自分のスタックを作る</Button>
        </Link>
      </div>
    </>
  );
}
