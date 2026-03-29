"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { TechGrid } from "@/components/tech-grid";
import { ExportButtons } from "@/components/export-buttons";
import { RestoreInput } from "@/components/restore-input";
import { decode, type TechStack } from "@/lib/encoder";

function HomeContent() {
  const searchParams = useSearchParams();
  const [stack, setStack] = useState<TechStack>({});
  const [searchQuery, setSearchQuery] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const restoreHash = searchParams.get("restore");
    if (restoreHash) {
      try {
        setStack(decode(restoreHash));
      } catch {
        // invalid hash, ignore
      }
    }
  }, [searchParams]);

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

        <div ref={gridRef}>
          <TechGrid
            stack={stack}
            onStackChange={setStack}
            searchQuery={searchQuery}
          />
        </div>

        <div className="sticky bottom-4 bg-background/80 backdrop-blur-sm border rounded-lg p-4 space-y-4">
          <ExportButtons stack={stack} targetRef={gridRef} />
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
