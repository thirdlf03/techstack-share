# Profile Embed Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow users to set a display name and avatar (GitHub ID or file upload) that appears on share cards, exported images, and OG images.

**Architecture:** Extend the encoder to support a `SharePayload` wrapping `TechStack` + optional profile data (name, githubId). The profile flows through all rendering paths. GitHub avatars use `https://github.com/{id}.png`. File uploads are local-only (not encoded in share URLs). Backward compatibility: old hashes decoding to a plain `TechStack` still work.

**Tech Stack:** React state, pako encoder, Canvas 2D, next/og ImageResponse

---

### Task 1: Extend encoder with profile support (backward-compatible)

**Files:**

- Modify: `src/lib/encoder.ts`
- Modify: `src/lib/encoder.test.ts`

**Step 1: Write failing tests for new payload format**

Add to `encoder.test.ts`:

```ts
import { encode, decode, encodePayload, decodePayload, type SharePayload } from "./encoder";

describe("payload encoder", () => {
  it("should encode and decode payload with profile", () => {
    const payload: SharePayload = {
      stack: { react: 5, ts: 4 },
      profile: { name: "Alice", githubId: "alice" },
    };
    const hash = encodePayload(payload);
    expect(decodePayload(hash)).toEqual(payload);
  });

  it("should encode and decode payload without profile", () => {
    const payload: SharePayload = { stack: { go: 3 } };
    const hash = encodePayload(payload);
    expect(decodePayload(hash)).toEqual(payload);
  });

  it("should decode legacy hash (plain TechStack) as payload", () => {
    const legacyHash = encode({ react: 5 });
    const payload = decodePayload(legacyHash);
    expect(payload.stack).toEqual({ react: 5 });
    expect(payload.profile).toBeUndefined();
  });

  it("should encode payload with name only (no githubId)", () => {
    const payload: SharePayload = {
      stack: { rust: 4 },
      profile: { name: "Bob" },
    };
    const hash = encodePayload(payload);
    expect(decodePayload(hash)).toEqual(payload);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/lib/encoder.test.ts`
Expected: FAIL — `encodePayload` / `decodePayload` / `SharePayload` not found

**Step 3: Implement encodePayload / decodePayload**

In `encoder.ts`, add:

```ts
export type Profile = {
  name?: string;
  githubId?: string;
};

export type SharePayload = {
  stack: TechStack;
  profile?: Profile;
};

export function encodePayload(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  const compressed = pako.deflate(json);
  const binary = String.fromCharCode(...compressed);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodePayload(hash: string): SharePayload {
  const base64 = hash.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const json = pako.inflate(bytes, { to: "string" });
  const parsed = JSON.parse(json);

  // Backward compat: old hashes encode a plain TechStack (Record<string, number>)
  if (parsed && typeof parsed === "object" && !("stack" in parsed)) {
    return { stack: parsed as TechStack };
  }

  return parsed as SharePayload;
}
```

Keep existing `encode`/`decode` unchanged for backward compat.

**Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/lib/encoder.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```
feat: add encodePayload/decodePayload with profile support
```

---

### Task 2: Create ProfileInput component

**Files:**

- Create: `src/components/profile-input.tsx`

**Step 1: Build the component**

```tsx
"use client";

import { useCallback, useRef, useState } from "react";
import type { Profile } from "@/lib/encoder";

type ProfileInputProps = {
  profile: Profile;
  avatarPreview: string | null; // data URL from file upload or GitHub avatar URL
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
      if (value) onAvatarFileChange(null); // GitHub ID takes priority, clear upload
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
        onProfileChange({ ...profile, githubId: undefined }); // clear GitHub ID
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
    ? `https://github.com/${profile.githubId}.png?size=80`
    : null;

  const displayAvatar = avatarPreview || githubAvatarUrl;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        {displayAvatar ? (
          <img
            src={displayAvatar}
            alt=""
            className="size-10 rounded-full object-cover border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
            ?
          </div>
        )}
        {displayAvatar && (
          <button
            type="button"
            onClick={handleClearAvatar}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            クリア
          </button>
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
```

**Step 2: Commit**

```
feat: add ProfileInput component for name, GitHub ID, and avatar upload
```

---

### Task 3: Wire profile state into HomeContent

**Files:**

- Modify: `src/app/page.tsx`
- Modify: `src/components/export-buttons.tsx`

**Step 1: Add profile state and ProfileInput to page**

In HomeContent, add state:

```ts
const [profile, setProfile] = useState<Profile>({});
const [avatarFile, setAvatarFile] = useState<string | null>(null);
```

Import `ProfileInput` and `Profile` type. Place `<ProfileInput>` above the search bar.

Update `PreviewPanel` to accept and display profile. Pass profile to `ExportButtons` and `ActionPanel`.

**Step 2: Update PreviewPanel header to show profile**

Replace static "My TechStack" heading with profile name + avatar when available.

**Step 3: Update ExportButtons to encode profile**

Change `encode(stack)` → `encodePayload({ stack, profile })` for share link. Pass profile to `renderShareCardImage`.

**Step 4: Add note about file upload limitation**

Under ProfileInput, show: `※アップロード画像は共有リンク・OGには反映されません`

**Step 5: Commit**

```
feat: wire profile state into main page and export buttons
```

---

### Task 4: Update ShareCard to display profile

**Files:**

- Modify: `src/components/share-card.tsx`

**Step 1: Accept optional profile props**

Add props: `name?: string`, `avatarUrl?: string | null`.
When provided, render avatar + name in the card header instead of plain "My TechStack".

**Step 2: Commit**

```
feat: display profile name and avatar in ShareCard
```

---

### Task 5: Update Canvas export to render profile

**Files:**

- Modify: `src/lib/export-image.ts`

**Step 1: Accept profile in renderShareCardImage**

Add to `ExportImageOptions`:

```ts
profile?: { name?: string; avatarUrl?: string | null };
```

**Step 2: Draw avatar circle + name in header**

In the header area (where "My TechStack" is drawn):

- If avatarUrl provided, load as Image and draw as clipped circle (left side)
- If name provided, draw it as the title instead of "My TechStack"
- Keep "N skills" subtitle

Update `measureHeight` if the header needs more space.

**Step 3: Commit**

```
feat: render profile avatar and name in Canvas export
```

---

### Task 6: Update OG image to render profile

**Files:**

- Modify: `src/app/api/og/route.tsx`

**Step 1: Switch from decode to decodePayload**

```ts
const { stack, profile } = decodePayload(data);
```

**Step 2: Render profile in OG header**

If `profile.githubId`, use `<img src={`https://github.com/${profile.githubId}.png?size=80`} />`(rounded).
If`profile.name`, replace "My TechStack" with the name.

**Step 3: Commit**

```
feat: render profile in OG image with GitHub avatar
```

---

### Task 7: Update share page to display profile

**Files:**

- Modify: `src/app/share/[hash]/page.tsx`

**Step 1: Switch from decode to decodePayload**

Use `decodePayload(hash)` to get profile info.

**Step 2: Pass profile to ShareCard**

Pass `name={profile?.name}` and `avatarUrl` (constructed from githubId) to ShareCard.

**Step 3: Update metadata**

If profile has a name, use it in the OG title/description: e.g., `"{name}'s TechStack"`.

**Step 4: Commit**

```
feat: display profile on share page and in OG metadata
```

---

### Task 8: Final build verification

**Step 1: Run tests**

Run: `pnpm test:run`
Expected: ALL PASS

**Step 2: Run build**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Final commit with all remaining changes**

```
feat: profile embed — name and avatar on share cards, export, and OG images
```
