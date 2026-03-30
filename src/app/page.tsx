"use client";

import { Suspense, memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExportButtons } from "@/components/export-buttons";
import { RenderProfiler } from "@/components/render-profiler";
import { RestoreInput } from "@/components/restore-input";
import { SearchBar } from "@/components/search-bar";
import { ShareCard } from "@/components/share-card";
import { TechGrid } from "@/components/tech-grid";
import { decode, type TechStack } from "@/lib/encoder";
import { endPerfMark, reportPerf, startPerfMark } from "@/lib/perf";

type SharedPanelProps = {
  stack: TechStack;
};

type ActionPanelProps = SharedPanelProps & {
  onRestore: (stack: TechStack) => void;
};

const PreviewPanel = memo(function PreviewPanel({ stack }: SharedPanelProps) {
  return (
    <RenderProfiler id="SharePreview">
      <div>
        <h2 className="text-xl font-semibold mb-4">プレビュー</h2>
        <div className="bg-background p-6 rounded-xl border">
          <h3 className="text-lg font-bold mb-4">My TechStack</h3>
          <ShareCard stack={stack} />
        </div>
      </div>
    </RenderProfiler>
  );
});

const ActionPanel = memo(function ActionPanel({ stack, onRestore }: ActionPanelProps) {
  return (
    <RenderProfiler id="ActionPanel">
      <div className="sticky bottom-4 bg-background/80 backdrop-blur-sm border rounded-lg p-4 space-y-4">
        <ExportButtons stack={stack} />
        <RestoreInput onRestore={onRestore} />
      </div>
    </RenderProfiler>
  );
});

function HomeContent() {
  const searchParams = useSearchParams();
  const restoreHash = searchParams.get("restore");

  const restorePayload = useMemo(() => {
    if (!restoreHash) {
      return {
        decodeDuration: 0,
        error: null as string | null,
        stack: {} as TechStack,
      };
    }

    const startedAt = performance.now();

    try {
      const restoredStack = decode(restoreHash);
      return {
        decodeDuration: performance.now() - startedAt,
        error: null as string | null,
        stack: restoredStack,
      };
    } catch (error) {
      return {
        decodeDuration: performance.now() - startedAt,
        error: error instanceof Error ? error.message : "unknown decode error",
        stack: {} as TechStack,
      };
    }
  }, [restoreHash]);

  const [stack, setStack] = useState<TechStack>(restorePayload.stack);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const selectedCount = Object.keys(stack).length;

  useEffect(() => {
    if (!restoreHash) {
      return;
    }

    setStack(restorePayload.stack);
    reportPerf("restore-param", {
      decodeDuration: restorePayload.decodeDuration,
      error: restorePayload.error,
      hashLength: restoreHash.length,
      restoredCount: Object.keys(restorePayload.stack).length,
    });
  }, [restoreHash, restorePayload.decodeDuration, restorePayload.error, restorePayload.stack]);

  useEffect(() => {
    reportPerf("home-mounted", {
      restoredCount: selectedCount,
      withRestoreParam: Boolean(restoreHash),
    });
    // We only need the first mount as a baseline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endPerfMark("search-update", {
      queryLength: deferredSearchQuery.length,
    });
  }, [deferredSearchQuery]);

  useEffect(() => {
    endPerfMark("stack-update", { selectedCount });
    endPerfMark("restore-apply", { selectedCount });
  }, [selectedCount]);

  const handleSearchChange = useCallback(
    (nextValue: string) => {
      startPerfMark("search-update", {
        nextLength: nextValue.length,
        previousLength: searchQuery.length,
      });
      reportPerf("search-input", {
        nextLength: nextValue.length,
        previousLength: searchQuery.length,
      });
      setSearchQuery(nextValue);
    },
    [searchQuery],
  );

  const handleRatingChange = useCallback(
    (techId: string, rating: number) => {
      const nextStack = { ...stack };
      if (rating === 0) {
        delete nextStack[techId];
      } else {
        nextStack[techId] = rating;
      }

      const nextSelectedCount = Object.keys(nextStack).length;
      startPerfMark("stack-update", {
        nextSelectedCount,
        previousSelectedCount: selectedCount,
      });
      reportPerf("stack-input", {
        nextSelectedCount,
        previousSelectedCount: selectedCount,
      });
      setStack(nextStack);
    },
    [selectedCount, stack],
  );

  const handleRestore = useCallback((nextStack: TechStack) => {
    startPerfMark("restore-apply", {
      restoredCount: Object.keys(nextStack).length,
    });
    reportPerf("restore-input-apply", {
      restoredCount: Object.keys(nextStack).length,
    });
    setStack(nextStack);
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">TechStack Share</h1>
      <p className="text-muted-foreground mb-6">あなたの技術スタックと熟練度を共有しよう</p>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
          {selectedCount > 0 && (
            <span className="text-sm text-muted-foreground">{selectedCount}個の技術を選択中</span>
          )}
        </div>

        <RenderProfiler id="TechGrid">
          <TechGrid
            stack={stack}
            onRatingChange={handleRatingChange}
            searchQuery={deferredSearchQuery}
          />
        </RenderProfiler>

        {selectedCount > 0 && <PreviewPanel stack={stack} />}

        <ActionPanel stack={stack} onRestore={handleRestore} />
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
