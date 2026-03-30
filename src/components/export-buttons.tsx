"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { reportPerf } from "@/lib/perf";
import { encode, type TechStack } from "@/lib/encoder";
import { renderShareCardImage } from "@/lib/export-image";

type ExportButtonsProps = {
  stack: TechStack;
};

export function ExportButtons({ stack }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);
  const isEmpty = Object.keys(stack).length === 0;

  const handleCopyLink = useCallback(async () => {
    const encodeStartedAt = performance.now();
    const hash = encode(stack);
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
  }, [stack]);

  const handleExportImage = useCallback(async () => {
    const renderStartedAt = performance.now();
    const blob = await renderShareCardImage(stack, { pixelRatio: 2 });
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
  }, [stack]);

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
