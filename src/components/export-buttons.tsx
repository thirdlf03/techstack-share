"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { reportPerf } from "@/lib/perf";
import { encodePayload, type Profile, type TechStack } from "@/lib/encoder";
import { renderShareCardImage } from "@/lib/export-image";

type ExportButtonsProps = {
  stack: TechStack;
  profile: Profile;
  avatarFile: string | null;
};

export function ExportButtons({ stack, profile, avatarFile }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);
  const isEmpty = Object.keys(stack).length === 0;

  const handleCopyLink = useCallback(async () => {
    const encodeStartedAt = performance.now();
    const cleanProfile = (profile.name || profile.githubId) ? profile : undefined;
    const hash = encodePayload({ stack, profile: cleanProfile });
    const encodeDuration = performance.now() - encodeStartedAt;
    const url = `${window.location.origin}/share/${hash}`;

    const clipboardStartedAt = performance.now();
    await navigator.clipboard.writeText(url);
    reportPerf("copy-share-link", {
      clipboardDuration: performance.now() - clipboardStartedAt,
      encodeDuration,
      selectedCount: Object.keys(stack).length,
      urlLength: url.length,
    });

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [stack, profile]);

  const handleExportImage = useCallback(async () => {
    const avatarUrl = avatarFile
      || (profile.githubId ? `https://avatars.githubusercontent.com/${profile.githubId}?size=80` : null);
    const renderStartedAt = performance.now();
    const blob = await renderShareCardImage(stack, {
      pixelRatio: 2,
      profile: { name: profile.name, avatarUrl },
    });
    const renderDuration = performance.now() - renderStartedAt;
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = "techstack.png";
    link.href = objectUrl;
    link.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);

    reportPerf("export-image", {
      blobSize: blob.size,
      importDuration: 0,
      renderDuration,
      selectedCount: Object.keys(stack).length,
      totalDuration: renderDuration,
    });
  }, [stack, profile, avatarFile]);

  return (
    <div className="flex gap-3 flex-wrap">
      <Button onClick={handleCopyLink} disabled={isEmpty} variant="default">
        {copied ? "コピーしました!" : "共有リンクをコピー"}
      </Button>
      <Button onClick={handleExportImage} disabled={isEmpty} variant="outline">
        画像で保存
      </Button>
    </div>
  );
}
