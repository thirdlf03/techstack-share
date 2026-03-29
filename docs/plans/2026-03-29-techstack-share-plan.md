# TechStack Share Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 技術スタックと熟練度を入力し、画像エクスポートやURL共有ができるWebアプリを構築する。

**Architecture:** Next.js App Router によるフロントエンドのみの構成。データはpako圧縮+Base64でURLに埋め込み、DBは使用しない。OGPはVercel OG Edge Functionで動的生成。

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Devicon (CDN), pako, html2canvas, Vitest, Vercel OG

---

## Task 1: プロジェクトスキャフォールディング

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts` (via create-next-app)
- Create: `vitest.config.mts`
- Create: `src/lib/utils.ts`
- Modify: `src/app/layout.tsx` (Devicon CDN追加)

**Step 1: Next.jsプロジェクト作成**

Run:
```bash
cd /Users/thirdlf03/src/github.com/thirdlf03/techstack-share
pnpm dlx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --turbopack
```

NOTE: 既にgit initされているディレクトリなので `.` を指定。プロンプトが出た場合はデフォルトで進める。

**Step 2: 依存パッケージのインストール**

Run:
```bash
pnpm add pako html2canvas
pnpm add -D @types/pako vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom vite-tsconfig-paths
```

**Step 3: shadcn/ui セットアップ**

Run:
```bash
pnpm dlx shadcn@latest init -d
```

デフォルト設定で進める（New York style, Zinc color, CSS variables enabled）。

次に必要なコンポーネントを追加:
```bash
pnpm dlx shadcn@latest add input badge button tooltip dialog
```

**Step 4: Vitest設定ファイル作成**

Create `vitest.config.mts`:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

Create `vitest.setup.ts`:
```typescript
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

**Step 5: package.jsonにテストスクリプト追加**

`package.json` の `scripts` に追加:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

**Step 6: Devicon CDNをlayout.tsxに追加**

`src/app/layout.tsx` の `<head>` 内に追加:
```tsx
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
/>
```

**Step 7: 動作確認**

Run:
```bash
pnpm run build
pnpm run test:run
```
Expected: ビルド成功、テストは0件で終了（テストファイルがまだないため）。

**Step 8: コミット**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with shadcn/ui, vitest, and devicon"
```

---

## Task 2: エンコーダー/デコーダー（TDD）

**Files:**
- Create: `src/lib/encoder.ts`
- Create: `src/lib/encoder.test.ts`

**Step 1: テストを書く**

Create `src/lib/encoder.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { encode, decode } from "./encoder";

describe("encoder", () => {
  it("should encode and decode an empty stack", () => {
    const stack = {};
    const encoded = encode(stack);
    expect(decode(encoded)).toEqual(stack);
  });

  it("should encode and decode a single technology", () => {
    const stack = { aws: 3 };
    const encoded = encode(stack);
    expect(decode(encoded)).toEqual(stack);
  });

  it("should encode and decode multiple technologies", () => {
    const stack = { aws: 3, react: 5, go: 4, docker: 2, python: 1 };
    const encoded = encode(stack);
    expect(decode(encoded)).toEqual(stack);
  });

  it("should produce URL-safe strings", () => {
    const stack = { aws: 3, react: 5, go: 4 };
    const encoded = encode(stack);
    expect(encoded).not.toMatch(/[+/=]/);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("should handle all rating values 1-5", () => {
    const stack = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    const encoded = encode(stack);
    expect(decode(encoded)).toEqual(stack);
  });

  it("should produce a compact string for 50 technologies", () => {
    const stack: Record<string, number> = {};
    for (let i = 0; i < 50; i++) {
      stack[`tech${i}`] = (i % 5) + 1;
    }
    const encoded = encode(stack);
    expect(encoded.length).toBeLessThan(300);
    expect(decode(encoded)).toEqual(stack);
  });
});
```

**Step 2: テストが失敗することを確認**

Run: `pnpm run test:run -- src/lib/encoder.test.ts`
Expected: FAIL — `encode` と `decode` が存在しない。

**Step 3: 最小限の実装**

Create `src/lib/encoder.ts`:
```typescript
import pako from "pako";

export type TechStack = Record<string, number>;

export function encode(stack: TechStack): string {
  const json = JSON.stringify(stack);
  const compressed = pako.deflate(json);
  const binary = String.fromCharCode(...compressed);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decode(hash: string): TechStack {
  const base64 = hash.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const json = pako.inflate(bytes, { to: "string" });
  return JSON.parse(json);
}
```

**Step 4: テストが通ることを確認**

Run: `pnpm run test:run -- src/lib/encoder.test.ts`
Expected: 6 tests PASS。

**Step 5: コミット**

```bash
git add src/lib/encoder.ts src/lib/encoder.test.ts
git commit -m "feat: add pako-based URL-safe encoder/decoder for tech stack data"
```

---

## Task 3: 技術データ定義

**Files:**
- Create: `src/data/technologies.ts`
- Create: `src/data/technologies.test.ts`

**Step 1: 型定義と技術データを作成**

Create `src/data/technologies.ts`:
```typescript
export const CATEGORIES = [
  "language",
  "frontend",
  "backend",
  "cloud",
  "database",
  "devops",
  "mobile",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  language: "Language",
  frontend: "Frontend",
  backend: "Backend",
  cloud: "Cloud",
  database: "Database",
  devops: "DevOps",
  mobile: "Mobile",
  other: "Other",
};

export type Technology = {
  id: string;
  name: string;
  deviconClass: string;
  category: Category;
};

export const technologies: Technology[] = [
  // Language
  { id: "js", name: "JavaScript", deviconClass: "devicon-javascript-plain", category: "language" },
  { id: "ts", name: "TypeScript", deviconClass: "devicon-typescript-plain", category: "language" },
  { id: "python", name: "Python", deviconClass: "devicon-python-plain", category: "language" },
  { id: "go", name: "Go", deviconClass: "devicon-go-plain", category: "language" },
  { id: "rust", name: "Rust", deviconClass: "devicon-rust-original", category: "language" },
  { id: "java", name: "Java", deviconClass: "devicon-java-plain", category: "language" },
  { id: "csharp", name: "C#", deviconClass: "devicon-csharp-plain", category: "language" },
  { id: "cpp", name: "C++", deviconClass: "devicon-cplusplus-plain", category: "language" },
  { id: "ruby", name: "Ruby", deviconClass: "devicon-ruby-plain", category: "language" },
  { id: "php", name: "PHP", deviconClass: "devicon-php-plain", category: "language" },
  { id: "swift", name: "Swift", deviconClass: "devicon-swift-plain", category: "language" },
  { id: "kotlin", name: "Kotlin", deviconClass: "devicon-kotlin-plain", category: "language" },
  { id: "c", name: "C", deviconClass: "devicon-c-plain", category: "language" },
  { id: "scala", name: "Scala", deviconClass: "devicon-scala-plain", category: "language" },
  { id: "elixir", name: "Elixir", deviconClass: "devicon-elixir-plain", category: "language" },
  { id: "dart", name: "Dart", deviconClass: "devicon-dart-plain", category: "language" },
  { id: "r", name: "R", deviconClass: "devicon-r-plain", category: "language" },
  { id: "lua", name: "Lua", deviconClass: "devicon-lua-plain", category: "language" },
  { id: "haskell", name: "Haskell", deviconClass: "devicon-haskell-plain", category: "language" },
  { id: "perl", name: "Perl", deviconClass: "devicon-perl-plain", category: "language" },
  { id: "zig", name: "Zig", deviconClass: "devicon-zig-plain", category: "language" },

  // Frontend
  { id: "react", name: "React", deviconClass: "devicon-react-plain", category: "frontend" },
  { id: "vue", name: "Vue", deviconClass: "devicon-vuejs-plain", category: "frontend" },
  { id: "nextjs", name: "Next.js", deviconClass: "devicon-nextjs-plain", category: "frontend" },
  { id: "nuxt", name: "Nuxt", deviconClass: "devicon-nuxtjs-plain", category: "frontend" },
  { id: "svelte", name: "Svelte", deviconClass: "devicon-svelte-plain", category: "frontend" },
  { id: "angular", name: "Angular", deviconClass: "devicon-angularjs-plain", category: "frontend" },
  { id: "astro", name: "Astro", deviconClass: "devicon-astro-plain", category: "frontend" },
  { id: "solid", name: "SolidJS", deviconClass: "devicon-solidjs-plain", category: "frontend" },
  { id: "htmx", name: "htmx", deviconClass: "devicon-htmx-plain", category: "frontend" },
  { id: "tailwind", name: "Tailwind CSS", deviconClass: "devicon-tailwindcss-plain", category: "frontend" },
  { id: "sass", name: "Sass", deviconClass: "devicon-sass-original", category: "frontend" },

  // Backend
  { id: "nodejs", name: "Node.js", deviconClass: "devicon-nodejs-plain", category: "backend" },
  { id: "express", name: "Express", deviconClass: "devicon-express-original", category: "backend" },
  { id: "django", name: "Django", deviconClass: "devicon-django-plain", category: "backend" },
  { id: "flask", name: "Flask", deviconClass: "devicon-flask-original", category: "backend" },
  { id: "fastapi", name: "FastAPI", deviconClass: "devicon-fastapi-plain", category: "backend" },
  { id: "spring", name: "Spring", deviconClass: "devicon-spring-plain", category: "backend" },
  { id: "rails", name: "Rails", deviconClass: "devicon-rails-plain", category: "backend" },
  { id: "gin", name: "Gin", deviconClass: "devicon-gin-plain", category: "backend" },
  { id: "nestjs", name: "NestJS", deviconClass: "devicon-nestjs-plain", category: "backend" },
  { id: "graphql", name: "GraphQL", deviconClass: "devicon-graphql-plain", category: "backend" },
  { id: "nginx", name: "Nginx", deviconClass: "devicon-nginx-original", category: "backend" },

  // Cloud
  { id: "aws", name: "AWS", deviconClass: "devicon-amazonwebservices-plain-wordmark", category: "cloud" },
  { id: "gcp", name: "Google Cloud", deviconClass: "devicon-googlecloud-plain", category: "cloud" },
  { id: "azure", name: "Azure", deviconClass: "devicon-azure-plain", category: "cloud" },
  { id: "cloudflare", name: "Cloudflare", deviconClass: "devicon-cloudflare-plain", category: "cloud" },
  { id: "vercel", name: "Vercel", deviconClass: "devicon-vercel-original", category: "cloud" },
  { id: "firebase", name: "Firebase", deviconClass: "devicon-firebase-plain", category: "cloud" },
  { id: "heroku", name: "Heroku", deviconClass: "devicon-heroku-original", category: "cloud" },
  { id: "netlify", name: "Netlify", deviconClass: "devicon-netlify-plain", category: "cloud" },
  { id: "digitalocean", name: "DigitalOcean", deviconClass: "devicon-digitalocean-plain", category: "cloud" },

  // Database
  { id: "postgresql", name: "PostgreSQL", deviconClass: "devicon-postgresql-plain", category: "database" },
  { id: "mysql", name: "MySQL", deviconClass: "devicon-mysql-plain", category: "database" },
  { id: "mongodb", name: "MongoDB", deviconClass: "devicon-mongodb-plain", category: "database" },
  { id: "redis", name: "Redis", deviconClass: "devicon-redis-plain", category: "database" },
  { id: "sqlite", name: "SQLite", deviconClass: "devicon-sqlite-plain", category: "database" },
  { id: "dynamodb", name: "DynamoDB", deviconClass: "devicon-dynamodb-plain", category: "database" },
  { id: "supabase", name: "Supabase", deviconClass: "devicon-supabase-plain", category: "database" },
  { id: "neo4j", name: "Neo4j", deviconClass: "devicon-neo4j-plain", category: "database" },
  { id: "cassandra", name: "Cassandra", deviconClass: "devicon-cassandra-plain", category: "database" },

  // DevOps
  { id: "docker", name: "Docker", deviconClass: "devicon-docker-plain", category: "devops" },
  { id: "kubernetes", name: "Kubernetes", deviconClass: "devicon-kubernetes-plain", category: "devops" },
  { id: "terraform", name: "Terraform", deviconClass: "devicon-terraform-plain", category: "devops" },
  { id: "githubactions", name: "GitHub Actions", deviconClass: "devicon-githubactions-plain", category: "devops" },
  { id: "jenkins", name: "Jenkins", deviconClass: "devicon-jenkins-plain", category: "devops" },
  { id: "ansible", name: "Ansible", deviconClass: "devicon-ansible-plain", category: "devops" },
  { id: "prometheus", name: "Prometheus", deviconClass: "devicon-prometheus-original", category: "devops" },
  { id: "grafana", name: "Grafana", deviconClass: "devicon-grafana-plain", category: "devops" },
  { id: "gitlab", name: "GitLab CI", deviconClass: "devicon-gitlab-plain", category: "devops" },
  { id: "circleci", name: "CircleCI", deviconClass: "devicon-circleci-plain", category: "devops" },
  { id: "argocd", name: "ArgoCD", deviconClass: "devicon-argocd-plain", category: "devops" },

  // Mobile
  { id: "reactnative", name: "React Native", deviconClass: "devicon-react-plain", category: "mobile" },
  { id: "flutter", name: "Flutter", deviconClass: "devicon-flutter-plain", category: "mobile" },
  { id: "swiftui", name: "SwiftUI", deviconClass: "devicon-swift-plain", category: "mobile" },
  { id: "androidstudio", name: "Android", deviconClass: "devicon-android-plain", category: "mobile" },
  { id: "xcode", name: "Xcode", deviconClass: "devicon-xcode-plain", category: "mobile" },

  // Other
  { id: "git", name: "Git", deviconClass: "devicon-git-plain", category: "other" },
  { id: "linux", name: "Linux", deviconClass: "devicon-linux-plain", category: "other" },
  { id: "vim", name: "Vim", deviconClass: "devicon-vim-plain", category: "other" },
  { id: "neovim", name: "Neovim", deviconClass: "devicon-neovim-plain", category: "other" },
  { id: "vscode", name: "VS Code", deviconClass: "devicon-vscode-plain", category: "other" },
  { id: "figma", name: "Figma", deviconClass: "devicon-figma-plain", category: "other" },
  { id: "notion", name: "Notion", deviconClass: "devicon-notion-plain", category: "other" },
  { id: "bash", name: "Bash", deviconClass: "devicon-bash-plain", category: "other" },
  { id: "raspberrypi", name: "Raspberry Pi", deviconClass: "devicon-raspberrypi-plain", category: "other" },
  { id: "ubuntu", name: "Ubuntu", deviconClass: "devicon-ubuntu-plain", category: "other" },
  { id: "debian", name: "Debian", deviconClass: "devicon-debian-plain", category: "other" },
  { id: "jetbrains", name: "JetBrains", deviconClass: "devicon-jetbrains-plain", category: "other" },
];

export function getTechById(id: string): Technology | undefined {
  return technologies.find((t) => t.id === id);
}

export function getTechsByCategory(category: Category): Technology[] {
  return technologies.filter((t) => t.category === category);
}
```

**Step 2: バリデーションテストを書く**

Create `src/data/technologies.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import {
  technologies,
  CATEGORIES,
  getTechById,
  getTechsByCategory,
} from "./technologies";

describe("technologies data", () => {
  it("should have unique ids", () => {
    const ids = technologies.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should have valid categories", () => {
    for (const tech of technologies) {
      expect(CATEGORIES).toContain(tech.category);
    }
  });

  it("should have at least one tech per category", () => {
    for (const cat of CATEGORIES) {
      const techs = getTechsByCategory(cat);
      expect(techs.length).toBeGreaterThan(0);
    }
  });

  it("getTechById should return correct tech", () => {
    const aws = getTechById("aws");
    expect(aws).toBeDefined();
    expect(aws!.name).toBe("AWS");
  });

  it("getTechById should return undefined for unknown id", () => {
    expect(getTechById("nonexistent")).toBeUndefined();
  });

  it("all deviconClass should start with devicon-", () => {
    for (const tech of technologies) {
      expect(tech.deviconClass).toMatch(/^devicon-/);
    }
  });
});
```

**Step 3: テストを実行**

Run: `pnpm run test:run -- src/data/technologies.test.ts`
Expected: 6 tests PASS。

**Step 4: コミット**

```bash
git add src/data/technologies.ts src/data/technologies.test.ts
git commit -m "feat: add technology data definitions with 90+ techs across 8 categories"
```

---

## Task 4: StarRatingコンポーネント（TDD）

**Files:**
- Create: `src/components/star-rating.tsx`
- Create: `src/components/star-rating.test.tsx`

**Step 1: テストを書く**

Create `src/components/star-rating.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarRating } from "./star-rating";

describe("StarRating", () => {
  it("should render 5 stars", () => {
    render(<StarRating value={0} onChange={() => {}} />);
    const stars = screen.getAllByRole("button");
    expect(stars).toHaveLength(5);
  });

  it("should highlight stars up to the current value", () => {
    render(<StarRating value={3} onChange={() => {}} />);
    const stars = screen.getAllByRole("button");
    expect(stars[0]).toHaveAttribute("data-filled", "true");
    expect(stars[1]).toHaveAttribute("data-filled", "true");
    expect(stars[2]).toHaveAttribute("data-filled", "true");
    expect(stars[3]).toHaveAttribute("data-filled", "false");
    expect(stars[4]).toHaveAttribute("data-filled", "false");
  });

  it("should call onChange with clicked star index", () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);
    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[2]); // 3rd star
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("should deselect when clicking the same value", () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} />);
    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[2]); // click 3rd star again
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("should be read-only when readOnly is true", () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} readOnly />);
    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[4]);
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

**Step 2: テストが失敗することを確認**

Run: `pnpm run test:run -- src/components/star-rating.test.tsx`
Expected: FAIL — モジュールが存在しない。

**Step 3: 実装**

Create `src/components/star-rating.tsx`:
```tsx
"use client";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  readOnly?: boolean;
};

export function StarRating({ value, onChange, readOnly = false }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          data-filled={star <= value ? "true" : "false"}
          onClick={() => {
            if (readOnly) return;
            onChange(star === value ? 0 : star);
          }}
          className={`text-lg transition-colors ${
            star <= value
              ? "text-yellow-400"
              : "text-gray-300 dark:text-gray-600"
          } ${readOnly ? "cursor-default" : "cursor-pointer hover:text-yellow-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
```

**Step 4: テストが通ることを確認**

Run: `pnpm run test:run -- src/components/star-rating.test.tsx`
Expected: 5 tests PASS。

**Step 5: コミット**

```bash
git add src/components/star-rating.tsx src/components/star-rating.test.tsx
git commit -m "feat: add StarRating component with click-to-rate and read-only mode"
```

---

## Task 5: TechCardコンポーネント（TDD）

**Files:**
- Create: `src/components/tech-card.tsx`
- Create: `src/components/tech-card.test.tsx`

**Step 1: テストを書く**

Create `src/components/tech-card.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TechCard } from "./tech-card";

const mockTech = {
  id: "react",
  name: "React",
  deviconClass: "devicon-react-plain",
  category: "frontend" as const,
};

describe("TechCard", () => {
  it("should render technology name", () => {
    render(<TechCard tech={mockTech} rating={0} onRatingChange={() => {}} />);
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("should render devicon", () => {
    render(<TechCard tech={mockTech} rating={0} onRatingChange={() => {}} />);
    const icon = screen.getByTestId("tech-icon");
    expect(icon.className).toContain("devicon-react-plain");
  });

  it("should show star rating when rating > 0", () => {
    render(<TechCard tech={mockTech} rating={3} onRatingChange={() => {}} />);
    const filledStars = screen.getAllByRole("button").filter(
      (b) => b.getAttribute("data-filled") === "true"
    );
    expect(filledStars).toHaveLength(3);
  });

  it("should have selected style when rating > 0", () => {
    const { container } = render(
      <TechCard tech={mockTech} rating={3} onRatingChange={() => {}} />
    );
    expect(container.firstChild).toHaveAttribute("data-selected", "true");
  });

  it("should have unselected style when rating is 0", () => {
    const { container } = render(
      <TechCard tech={mockTech} rating={0} onRatingChange={() => {}} />
    );
    expect(container.firstChild).toHaveAttribute("data-selected", "false");
  });
});
```

**Step 2: テストが失敗することを確認**

Run: `pnpm run test:run -- src/components/tech-card.test.tsx`
Expected: FAIL。

**Step 3: 実装**

Create `src/components/tech-card.tsx`:
```tsx
"use client";

import type { Technology } from "@/data/technologies";
import { StarRating } from "./star-rating";

type TechCardProps = {
  tech: Technology;
  rating: number;
  onRatingChange: (rating: number) => void;
  readOnly?: boolean;
};

export function TechCard({ tech, rating, onRatingChange, readOnly = false }: TechCardProps) {
  const isSelected = rating > 0;

  return (
    <div
      data-selected={isSelected ? "true" : "false"}
      className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/50"
      }`}
    >
      <i
        data-testid="tech-icon"
        className={`${tech.deviconClass} colored text-3xl`}
      />
      <span className="text-xs font-medium text-center">{tech.name}</span>
      <StarRating value={rating} onChange={onRatingChange} readOnly={readOnly} />
    </div>
  );
}
```

**Step 4: テストが通ることを確認**

Run: `pnpm run test:run -- src/components/tech-card.test.tsx`
Expected: 5 tests PASS。

**Step 5: コミット**

```bash
git add src/components/tech-card.tsx src/components/tech-card.test.tsx
git commit -m "feat: add TechCard component with devicon and star rating"
```

---

## Task 6: SearchBarとTechGridコンポーネント

**Files:**
- Create: `src/components/search-bar.tsx`
- Create: `src/components/tech-grid.tsx`
- Create: `src/components/tech-grid.test.tsx`

**Step 1: SearchBar実装**

Create `src/components/search-bar.tsx`:
```tsx
"use client";

import { Input } from "@/components/ui/input";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="w-full max-w-md">
      <Input
        type="text"
        placeholder="技術を検索..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
```

**Step 2: TechGridテストを書く**

Create `src/components/tech-grid.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TechGrid } from "./tech-grid";

describe("TechGrid", () => {
  it("should render category headers", () => {
    render(<TechGrid stack={{}} onStackChange={() => {}} searchQuery="" />);
    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByText("Frontend")).toBeInTheDocument();
    expect(screen.getByText("Backend")).toBeInTheDocument();
  });

  it("should filter technologies by search query", () => {
    render(
      <TechGrid stack={{}} onStackChange={() => {}} searchQuery="React" />
    );
    expect(screen.getByText("React")).toBeInTheDocument();
    // JavaScript should NOT appear when searching "React"
    expect(screen.queryByText("JavaScript")).not.toBeInTheDocument();
  });

  it("should show empty categories as hidden when filtered", () => {
    render(
      <TechGrid stack={{}} onStackChange={() => {}} searchQuery="React" />
    );
    // Database category should not be rendered since no DB matches "React"
    expect(screen.queryByText("Database")).not.toBeInTheDocument();
  });
});
```

**Step 3: テストが失敗することを確認**

Run: `pnpm run test:run -- src/components/tech-grid.test.tsx`
Expected: FAIL。

**Step 4: TechGrid実装**

Create `src/components/tech-grid.tsx`:
```tsx
"use client";

import { CATEGORIES, CATEGORY_LABELS, getTechsByCategory } from "@/data/technologies";
import { TechCard } from "./tech-card";
import type { TechStack } from "@/lib/encoder";

type TechGridProps = {
  stack: TechStack;
  onStackChange: (stack: TechStack) => void;
  searchQuery: string;
  readOnly?: boolean;
};

export function TechGrid({ stack, onStackChange, searchQuery, readOnly = false }: TechGridProps) {
  const query = searchQuery.toLowerCase();

  return (
    <div className="space-y-8">
      {CATEGORIES.map((category) => {
        const techs = getTechsByCategory(category).filter((t) =>
          t.name.toLowerCase().includes(query)
        );

        if (techs.length === 0) return null;

        return (
          <section key={category}>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {techs.map((tech) => (
                <TechCard
                  key={tech.id}
                  tech={tech}
                  rating={stack[tech.id] ?? 0}
                  onRatingChange={(rating) => {
                    const next = { ...stack };
                    if (rating === 0) {
                      delete next[tech.id];
                    } else {
                      next[tech.id] = rating;
                    }
                    onStackChange(next);
                  }}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
```

**Step 5: テストが通ることを確認**

Run: `pnpm run test:run -- src/components/tech-grid.test.tsx`
Expected: 3 tests PASS。

**Step 6: コミット**

```bash
git add src/components/search-bar.tsx src/components/tech-grid.tsx src/components/tech-grid.test.tsx
git commit -m "feat: add SearchBar and TechGrid components with category grouping and filtering"
```

---

## Task 7: ExportButtonsコンポーネント

**Files:**
- Create: `src/components/export-buttons.tsx`
- Create: `src/components/export-buttons.test.tsx`

**Step 1: テストを書く**

Create `src/components/export-buttons.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExportButtons } from "./export-buttons";

// Mock html2canvas
vi.mock("html2canvas", () => ({
  default: vi.fn(() =>
    Promise.resolve({
      toDataURL: () => "data:image/png;base64,mock",
    })
  ),
}));

// Mock clipboard
Object.assign(navigator, {
  clipboard: { writeText: vi.fn(() => Promise.resolve()) },
});

describe("ExportButtons", () => {
  it("should render share link button", () => {
    render(<ExportButtons stack={{ aws: 3 }} targetRef={{ current: null }} />);
    expect(screen.getByText("共有リンクをコピー")).toBeInTheDocument();
  });

  it("should render image export button", () => {
    render(<ExportButtons stack={{ aws: 3 }} targetRef={{ current: null }} />);
    expect(screen.getByText("画像で保存")).toBeInTheDocument();
  });

  it("should disable buttons when stack is empty", () => {
    render(<ExportButtons stack={{}} targetRef={{ current: null }} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
```

**Step 2: テストが失敗することを確認**

Run: `pnpm run test:run -- src/components/export-buttons.test.tsx`
Expected: FAIL。

**Step 3: 実装**

Create `src/components/export-buttons.tsx`:
```tsx
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
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(targetRef.current, {
      backgroundColor: null,
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = "techstack.png";
    link.href = canvas.toDataURL("image/png");
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
```

**Step 4: テストが通ることを確認**

Run: `pnpm run test:run -- src/components/export-buttons.test.tsx`
Expected: 3 tests PASS。

**Step 5: コミット**

```bash
git add src/components/export-buttons.tsx src/components/export-buttons.test.tsx
git commit -m "feat: add ExportButtons with share link copy and image export"
```

---

## Task 8: メインページ（`/`）

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/components/restore-input.tsx`

**Step 1: RestoreInputコンポーネント作成**

Create `src/components/restore-input.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { decode, type TechStack } from "@/lib/encoder";

type RestoreInputProps = {
  onRestore: (stack: TechStack) => void;
};

export function RestoreInput({ onRestore }: RestoreInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleRestore = () => {
    try {
      // URLが貼られた場合は末尾のhash部分を抽出
      const hash = code.includes("/share/")
        ? code.split("/share/").pop()!
        : code;
      const stack = decode(hash.trim());
      onRestore(stack);
      setCode("");
      setError("");
    } catch {
      setError("無効な共有コードです");
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">共有コード / URLから復元</h3>
      <div className="flex gap-2">
        <Input
          placeholder="共有コードまたはURLを貼り付け..."
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
        />
        <Button onClick={handleRestore} variant="secondary" disabled={!code}>
          復元
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

**Step 2: メインページ実装**

Modify `src/app/page.tsx` to:
```tsx
"use client";

import { useState, useRef } from "react";
import { SearchBar } from "@/components/search-bar";
import { TechGrid } from "@/components/tech-grid";
import { ExportButtons } from "@/components/export-buttons";
import { RestoreInput } from "@/components/restore-input";
import type { TechStack } from "@/lib/encoder";

export default function Home() {
  const [stack, setStack] = useState<TechStack>({});
  const [searchQuery, setSearchQuery] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

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
```

**Step 3: layout.tsxを更新**

`src/app/layout.tsx` を以下のように更新（Devicon CDN + メタデータ）:

metadata に以下を設定:
```typescript
export const metadata: Metadata = {
  title: "TechStack Share",
  description: "あなたの技術スタックと熟練度を共有しよう",
};
```

`<head>` に Devicon CDN のlinkタグを追加（Task 1 Step 6で済）。

**Step 4: 開発サーバーで動作確認**

Run: `pnpm dev`
ブラウザで http://localhost:3000 を開き、以下を確認:
- カテゴリ別に技術がグリッド表示される
- 検索で絞り込みができる
- ★をクリックして熟練度設定ができる
- 共有リンクコピーが動作する
- 復元が動作する

**Step 5: コミット**

```bash
git add src/app/page.tsx src/app/layout.tsx src/components/restore-input.tsx
git commit -m "feat: build main page with tech selection, search, export, and restore"
```

---

## Task 9: 共有ビューページ（`/share/[hash]`）

**Files:**
- Create: `src/app/share/[hash]/page.tsx`
- Create: `src/components/share-card.tsx`

**Step 1: ShareCardコンポーネント作成**

Create `src/components/share-card.tsx`:
```tsx
import type { TechStack } from "@/lib/encoder";
import { CATEGORIES, CATEGORY_LABELS, getTechById, getTechsByCategory } from "@/data/technologies";
import { StarRating } from "./star-rating";

type ShareCardProps = {
  stack: TechStack;
};

export function ShareCard({ stack }: ShareCardProps) {
  const selectedIds = Object.keys(stack);

  return (
    <div className="space-y-6">
      {CATEGORIES.map((category) => {
        const techs = getTechsByCategory(category).filter((t) =>
          selectedIds.includes(t.id)
        );

        if (techs.length === 0) return null;

        return (
          <section key={category}>
            <h2 className="text-lg font-semibold mb-3 border-b pb-2">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {techs.map((tech) => (
                <div
                  key={tech.id}
                  className="flex flex-col items-center gap-2 rounded-xl border border-primary bg-primary/5 p-3"
                >
                  <i className={`${tech.deviconClass} colored text-3xl`} />
                  <span className="text-xs font-medium text-center">
                    {tech.name}
                  </span>
                  <StarRating
                    value={stack[tech.id]}
                    onChange={() => {}}
                    readOnly
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
```

**Step 2: 共有ページ実装**

Create `src/app/share/[hash]/page.tsx`:
```tsx
import { Metadata } from "next";
import { decode } from "@/lib/encoder";
import { ShareCard } from "@/components/share-card";
import { SharePageClient } from "./client";

type Props = {
  params: Promise<{ hash: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hash } = await params;
  return {
    title: "TechStack Share",
    description: "Check out my tech stack!",
    openGraph: {
      title: "TechStack Share",
      description: "Check out my tech stack!",
      images: [`/api/og?data=${hash}`],
    },
    twitter: {
      card: "summary_large_image",
      title: "TechStack Share",
      description: "Check out my tech stack!",
      images: [`/api/og?data=${hash}`],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { hash } = await params;

  let stack;
  try {
    stack = decode(hash);
  } catch {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold mb-4">無効な共有リンク</h1>
        <p className="text-muted-foreground">共有コードが正しくありません。</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">TechStack Share</h1>
      <p className="text-muted-foreground mb-6">共有された技術スタック</p>

      <ShareCard stack={stack} />

      <SharePageClient hash={hash} />
    </main>
  );
}
```

Create `src/app/share/[hash]/client.tsx`:
```tsx
"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type SharePageClientProps = {
  hash: string;
};

export function SharePageClient({ hash }: SharePageClientProps) {
  return (
    <div className="flex gap-3 mt-6">
      <Link href={`/?restore=${hash}`}>
        <Button variant="outline">このスタックを編集</Button>
      </Link>
    </div>
  );
}
```

**Step 3: メインページにURL復元対応を追加**

`src/app/page.tsx` に `useSearchParams` を追加して、`?restore=` パラメータからのスタック復元に対応:

`page.tsx` の `Home` コンポーネント冒頭に追加:
```tsx
import { useSearchParams } from "next/navigation";
import { decode } from "@/lib/encoder";
import { Suspense } from "react";

// useSearchParams を使うため Suspense で包む
// メイン内容を別コンポーネントに切り出す
```

NOTE: `useSearchParams` は Suspense boundary が必要。実装時に適切にラップすること。

**Step 4: 動作確認**

1. メインページで技術を選んで「共有リンクをコピー」
2. コピーしたURLを開いて共有ビューが表示されることを確認
3. 「このスタックを編集」でメインページに戻り、データが復元されることを確認

**Step 5: コミット**

```bash
git add src/app/share/ src/components/share-card.tsx
git commit -m "feat: add share view page with OGP metadata and edit link"
```

---

## Task 10: OGP API Route

**Files:**
- Create: `src/app/api/og/route.tsx`

**Step 1: OGP画像生成のEdge Function実装**

Create `src/app/api/og/route.tsx`:
```tsx
import { ImageResponse } from "next/og";
import { decode } from "@/lib/encoder";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  getTechById,
  getTechsByCategory,
} from "@/data/technologies";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data");

  if (!data) {
    return new Response("Missing data parameter", { status: 400 });
  }

  let stack;
  try {
    stack = decode(data);
  } catch {
    return new Response("Invalid data", { status: 400 });
  }

  const selectedIds = Object.keys(stack);

  // カテゴリごとに技術をグループ化
  const groups = CATEGORIES.map((cat) => ({
    label: CATEGORY_LABELS[cat],
    techs: getTechsByCategory(cat)
      .filter((t) => selectedIds.includes(t.id))
      .map((t) => ({ name: t.name, rating: stack[t.id] })),
  })).filter((g) => g.techs.length > 0);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          padding: "48px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: "36px",
            fontWeight: "bold",
            marginBottom: "32px",
          }}
        >
          TechStack Share
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            flex: 1,
          }}
        >
          {groups.map((group) => (
            <div key={group.label} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", fontSize: "18px", color: "#a1a1aa", fontWeight: "600" }}>
                {group.label}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {group.techs.map((tech) => (
                  <div
                    key={tech.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#1a1a2e",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      fontSize: "16px",
                    }}
                  >
                    <span>{tech.name}</span>
                    <span style={{ color: "#facc15" }}>
                      {"★".repeat(tech.rating)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

**Step 2: 動作確認**

Run: `pnpm dev`
ブラウザで以下にアクセス:
1. メインページで技術を選択 → 共有リンク生成
2. `/api/og?data={hash}` にアクセスしてOGP画像が表示されることを確認

**Step 3: コミット**

```bash
git add src/app/api/og/route.tsx
git commit -m "feat: add OGP dynamic image generation via Edge Function"
```

---

## Task 11: 全テスト実行 & 最終調整

**Files:**
- Modify: Various files as needed

**Step 1: 全テスト実行**

Run: `pnpm run test:run`
Expected: すべてのテストがPASS。

**Step 2: ビルド確認**

Run: `pnpm run build`
Expected: ビルドが成功。エラーや警告がないこと。

**Step 3: 最終的な動作確認**

Run: `pnpm start`

以下のフローを確認:
1. `/` で技術を選択、★で熟練度設定
2. 検索で絞り込み
3. 「共有リンクをコピー」→ URLが生成される
4. 共有URL `/share/{hash}` で読み取り専用ビュー表示
5. 「画像で保存」でPNGダウンロード
6. 復元欄に共有コードを貼り付けて復元
7. 「このスタックを編集」で入力画面に戻る

**Step 4: 問題があれば修正してコミット**

```bash
git add -A
git commit -m "fix: final adjustments from integration testing"
```

---

## 依存関係

```
Task 1 (scaffolding)
  ├── Task 2 (encoder) ── depends on pako
  ├── Task 3 (tech data) ── no deps beyond Task 1
  │
  ├── Task 4 (StarRating) ── no deps beyond Task 1
  │     └── Task 5 (TechCard) ── depends on Task 3 + 4
  │           └── Task 6 (SearchBar + TechGrid) ── depends on Task 3 + 5
  │                 └── Task 8 (Main Page) ── depends on Task 2 + 6 + 7
  │
  ├── Task 7 (ExportButtons) ── depends on Task 2
  │
  └── Task 9 (Share Page) ── depends on Task 2 + 3 + 4
        └── Task 10 (OGP) ── depends on Task 2 + 3
              └── Task 11 (Final) ── depends on all
```

NOTE: Task 2, 3, 4 は互いに独立しており並列実行可能。
