"use client";

import { useCallback, useRef } from "react";
import type { Profile } from "@/lib/encoder";

type ProfileInputProps = {
  profile: Profile;
  avatarPreview: string | null;
  onProfileChange: (profile: Profile) => void;
  onAvatarFileChange: (dataUrl: string | null) => void;
};

export function ProfileInput({
  profile,
  avatarPreview,
  onProfileChange,
  onAvatarFileChange,
}: ProfileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onProfileChange({ ...profile, name: e.target.value || undefined });
    },
    [profile, onProfileChange],
  );

  const handleGithubIdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      onProfileChange({ ...profile, githubId: value || undefined });
      if (value) onAvatarFileChange(null);
    },
    [profile, onProfileChange, onAvatarFileChange],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        onAvatarFileChange(reader.result as string);
        onProfileChange({ ...profile, githubId: undefined });
      };
      reader.readAsDataURL(file);
    },
    [profile, onProfileChange, onAvatarFileChange],
  );

  const handleClearAvatar = useCallback(() => {
    onAvatarFileChange(null);
    onProfileChange({ ...profile, githubId: undefined });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [profile, onProfileChange, onAvatarFileChange]);

  const githubAvatarUrl = profile.githubId
    ? `https://avatars.githubusercontent.com/${profile.githubId}?size=80`
    : null;

  const displayAvatar = avatarPreview || githubAvatarUrl;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        {displayAvatar ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayAvatar}
              alt=""
              className="size-10 rounded-full object-cover border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <button
              type="button"
              onClick={handleClearAvatar}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              クリア
            </button>
          </>
        ) : (
          <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
            ?
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <label className="text-xs text-muted-foreground">表示名</label>
        <input
          type="text"
          placeholder="Your Name"
          value={profile.name ?? ""}
          onChange={handleNameChange}
          maxLength={30}
          className="h-8 px-2 rounded border bg-background text-sm"
        />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <label className="text-xs text-muted-foreground">GitHub ID</label>
        <input
          type="text"
          placeholder="github-username"
          value={profile.githubId ?? ""}
          onChange={handleGithubIdChange}
          maxLength={39}
          className="h-8 px-2 rounded border bg-background text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">または画像</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-xs file:mr-2 file:px-2 file:py-1 file:rounded file:border file:bg-background file:text-sm file:cursor-pointer"
        />
      </div>
    </div>
  );
}
