"use client";

import { Suspense, memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExportButtons } from "@/components/export-buttons";
import { ProfileInput } from "@/components/profile-input";
import { RenderProfiler } from "@/components/render-profiler";
import { RestoreInput } from "@/components/restore-input";
import { SearchBar } from "@/components/search-bar";
import { RequestTechModal } from "@/components/request-tech-modal";
import { ShareCard } from "@/components/share-card";
import { TechGrid } from "@/components/tech-grid";
import { decodePayload, type Profile, type TechStack } from "@/lib/encoder";
import { endPerfMark, reportPerf, startPerfMark } from "@/lib/perf";

type PreviewPanelProps = {
  stack: TechStack;
  name?: string;
  avatarUrl?: string | null;
};

type ActionPanelProps = {
  stack: TechStack;
  profile: Profile;
  avatarFile: string | null;
  onRestore: (stack: TechStack) => void;
};

const PreviewPanel = memo(function PreviewPanel({ stack, name, avatarUrl }: PreviewPanelProps) {
  return (
    <RenderProfiler id="SharePreview">
      <div>
        <h2 className="text-xl font-semibold mb-4">プレビュー</h2>
        <div className="bg-background p-6 rounded-xl border">
          <h3 className="text-lg font-bold mb-4">{name || "My TechStack"}</h3>
          <ShareCard stack={stack} name={name} avatarUrl={avatarUrl} />
        </div>
      </div>
    </RenderProfiler>
  );
});

const ActionPanel = memo(function ActionPanel({
  stack,
  profile,
  avatarFile,
  onRestore,
}: ActionPanelProps) {
  return (
    <RenderProfiler id="ActionPanel">
      <div className="sticky bottom-4 bg-background/80 backdrop-blur-sm border rounded-lg p-4 space-y-4">
        <ExportButtons stack={stack} profile={profile} avatarFile={avatarFile} />
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
        profile: undefined as Profile | undefined,
        stack: {} as TechStack,
      };
    }

    const startedAt = performance.now();

    try {
      const decoded = decodePayload(restoreHash);
      return {
        decodeDuration: performance.now() - startedAt,
        error: null as string | null,
        profile: decoded.profile,
        stack: decoded.stack,
      };
    } catch (error) {
      return {
        decodeDuration: performance.now() - startedAt,
        error: error instanceof Error ? error.message : "unknown decode error",
        profile: undefined as Profile | undefined,
        stack: {} as TechStack,
      };
    }
  }, [restoreHash]);

  const [stack, setStack] = useState<TechStack>(restorePayload.stack);
  const [profile, setProfile] = useState<Profile>(restorePayload.profile ?? {});
  const [avatarFile, setAvatarFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const selectedCount = Object.keys(stack).length;

  const avatarUrl =
    avatarFile ||
    (profile.githubId ? `https://avatars.githubusercontent.com/${profile.githubId}?size=80` : null);

  useEffect(() => {
    if (!restoreHash) {
      return;
    }

    setStack(restorePayload.stack);
    if (restorePayload.profile) {
      setProfile(restorePayload.profile);
    }
    reportPerf("restore-param", {
      decodeDuration: restorePayload.decodeDuration,
      error: restorePayload.error,
      hashLength: restoreHash.length,
      restoredCount: Object.keys(restorePayload.stack).length,
    });
  }, [restoreHash, restorePayload.decodeDuration, restorePayload.error, restorePayload.profile, restorePayload.stack]);

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

  const handleRestore = useCallback((nextStack: TechStack, nextProfile?: Profile) => {
    startPerfMark("restore-apply", {
      restoredCount: Object.keys(nextStack).length,
    });
    reportPerf("restore-input-apply", {
      restoredCount: Object.keys(nextStack).length,
    });
    setStack(nextStack);
    if (nextProfile) {
      setProfile(nextProfile);
    }
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">TechStack Share</h1>
      <div className="flex items-center gap-4 mb-4">
        <p className="text-muted-foreground">あなたの技術スタックと熟練度を共有しよう</p>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground border rounded-md px-2 py-1 transition-colors cursor-pointer whitespace-nowrap"
          onClick={() => setRequestModalOpen(true)}
        >
          + 技術の追加をリクエスト
        </button>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-6">
        <span>★★★★★ Expert</span>
        <span>★★★★☆ Advanced</span>
        <span>★★★☆☆ Intermediate</span>
        <span>★★☆☆☆ Beginner</span>
        <span>★☆☆☆☆ Learning</span>
      </div>

      <div className="space-y-6">
        <ProfileInput
          profile={profile}
          avatarPreview={avatarFile}
          onProfileChange={setProfile}
          onAvatarFileChange={setAvatarFile}
        />
        <p className="text-xs text-muted-foreground -mt-4">
          ※アップロード画像は共有リンク・OGには反映されません
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
          {selectedCount > 0 && (
            <span className="text-sm text-muted-foreground">{selectedCount}個の技術を選択中</span>
          )}
        </div>

        <div id="tech-grid">
          <RenderProfiler id="TechGrid">
            <TechGrid
              stack={stack}
              onRatingChange={handleRatingChange}
              searchQuery={deferredSearchQuery}
            />
          </RenderProfiler>
        </div>

        {selectedCount > 0 && (
          <>
            <PreviewPanel stack={stack} name={profile.name} avatarUrl={avatarUrl} />
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={() =>
                  document.getElementById("tech-grid")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                ↑ 選択に戻る
              </button>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                ↑ トップに戻る
              </button>
            </div>
          </>
        )}

        <ActionPanel
          stack={stack}
          profile={profile}
          avatarFile={avatarFile}
          onRestore={handleRestore}
        />
      </div>
      <RequestTechModal open={requestModalOpen} onClose={() => setRequestModalOpen(false)} />
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
