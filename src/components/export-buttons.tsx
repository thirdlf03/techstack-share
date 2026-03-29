"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { encode, type TechStack } from "@/lib/encoder";

type ExportButtonsProps = {
  stack: TechStack;
  targetRef: React.RefObject<HTMLDivElement | null>;
};

export function ExportButtons({ stack, targetRef }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);
  const isEmpty = Object.keys(stack).length === 0;

  const handleCopyLink = useCallback(async () => {
    const hash = encode(stack);
    const url = `${window.location.origin}/share/${hash}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [stack]);

  const handleExportImage = useCallback(async () => {
    if (!targetRef.current) return;
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(targetRef.current, { pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = "techstack.png";
    link.href = dataUrl;
    link.click();
  }, [targetRef]);

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
