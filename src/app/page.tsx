"use client";

import { useState, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { TechGrid } from "@/components/tech-grid";
import { ExportButtons } from "@/components/export-buttons";
import { RestoreInput } from "@/components/restore-input";
import { ShareCard } from "@/components/share-card";
import { decode, type TechStack } from "@/lib/encoder";

function HomeContent() {
  const searchParams = useSearchParams();

  const initialStack = useMemo<TechStack>(() => {
    const restoreHash = searchParams.get("restore");
    if (restoreHash) {
      try {
        return decode(restoreHash);
      } catch {
        return {};
      }
    }
    return {};
  }, [searchParams]);

  const [stack, setStack] = useState<TechStack>(initialStack);
  const [searchQuery, setSearchQuery] = useState("");
  const exportRef = useRef<HTMLDivElement>(null);

  const selectedCount = Object.keys(stack).length;

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">TechStack Share</h1>
      <p className="text-muted-foreground mb-6">
        あなたの技術スタックと熟練度を共有しよう
      </p>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          {selectedCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedCount}個の技術を選択中
            </span>
          )}
        </div>

        <TechGrid
          stack={stack}
          onStackChange={setStack}
          searchQuery={searchQuery}
        />

        {selectedCount > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">プレビュー</h2>
            <div ref={exportRef} className="bg-background p-6 rounded-xl border">
              <h3 className="text-lg font-bold mb-4">My TechStack</h3>
              <ShareCard stack={stack} />
            </div>
          </div>
        )}

        <div className="sticky bottom-4 bg-background/80 backdrop-blur-sm border rounded-lg p-4 space-y-4">
          <ExportButtons stack={stack} targetRef={exportRef} />
          <RestoreInput onRestore={setStack} />
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
