# TechStack Share - 設計ドキュメント

## 概要

技術スタックを共有できるWebアプリ。ユーザーが自分の技術スタックと熟練度を入力し、画像エクスポートやURL共有ができる。

## 技術選定

| 項目 | 選定 | 理由 |
|------|------|------|
| フレームワーク | Next.js (App Router) | SSR + Edge Function + Vercel デプロイ |
| UI | shadcn/ui + Tailwind CSS | カスタマイズ性、Next.jsとの相性 |
| アイコン | Devicon (CDN) | 800+の技術アイコン、最高の網羅性 |
| 画像エクスポート | html2canvas | DOM→Canvas変換、実績豊富 |
| 圧縮 | pako | zlib圧縮でURLをコンパクトに |
| OGP | Vercel OG (next/og) | Edge Functionで動的画像生成 |
| パッケージマネージャー | pnpm | 高速、ディスク効率 |
| デプロイ | Vercel | Next.jsとの最適な統合 |

## アーキテクチャ

### 全体構成

- フロントエンドのみ（DBなし）
- データはURLのBase64エンコード文字列に埋め込み
- OGPはEdge Functionで動的生成

### ページ構成

| ルート | 役割 | レンダリング |
|--------|------|-------------|
| `/` | 技術選択・熟練度入力画面 | CSR |
| `/share/[hash]` | 共有ビュー（読み取り専用カード） | SSR + CSR |
| `/api/og` | OGP画像の動的生成 | Edge Function |

### データフロー

1. ユーザーが `/` で技術を選択・熟練度を入力
2. 「共有」ボタンで pako圧縮 → Base64 → URL生成
3. `/share/{base64data}` にアクセスすると、URLからデコードしてカード表示
4. SNS等でURL共有時、`/api/og?data={base64data}` でOGP画像が動的生成

## データモデル

### 技術データ（静的定義）

```typescript
type Category =
  | "language" | "frontend" | "backend" | "cloud"
  | "database" | "devops" | "mobile" | "other";

type Technology = {
  id: string;           // 一意ID (例: "aws", "react")
  name: string;         // 表示名 (例: "AWS", "React")
  deviconClass: string; // Deviconクラス名
  category: Category;
};
```

### ユーザー選択ステート

```typescript
type TechStack = Record<string, number>; // { "aws": 3, "react": 5 }
```

### エンコード/デコード

- JSON → pako deflate → Base64 (URL-safe) でエンコード
- `+` → `-`, `/` → `_`, 末尾`=`除去 でURL-safe化
- 50技術選択で約150文字程度のBase64文字列

## UI設計

### 入力画面 (`/`)

- 上部に検索欄（技術名で絞り込み）
- カテゴリ別にグリッド表示
- 各技術はカード形式（Deviconアイコン + 技術名 + ★評価）
- カードクリックで熟練度セレクター表示（★1〜5）
- 選択済み技術はハイライト表示
- 下部に「画像で保存」「共有リンク生成」ボタン
- 共有コードからの復元入力欄

### 共有ビュー (`/share/[hash]`)

- 選択された技術のみカテゴリ別に表示
- 読み取り専用
- 「画像保存」「このスタックを編集」ボタン
- OGPメタタグ設定済み

### 熟練度

- 5段階（★1〜★5）
- ★1=入門, ★2=初級, ★3=中級, ★4=上級, ★5=エキスパート

## OGP画像生成

- Vercel OG (next/og) の `ImageResponse` を使用
- Edge Functionで1200x630pxの画像を動的生成
- カテゴリ別に技術名+★を表示
- Deviconフォントアイコンは使えないため、SVG imgまたはテキスト表示

## カテゴリ一覧（初期リリース）

1. **Language**: JavaScript, TypeScript, Python, Go, Rust, Java, C#, C++, Ruby, PHP, Swift, Kotlin 等
2. **Frontend**: React, Vue, Next.js, Nuxt, Svelte, Angular, Astro 等
3. **Backend**: Node.js, Django, Flask, Spring, Rails, Express, FastAPI, Gin, Echo 等
4. **Cloud**: AWS, GCP, Azure, Cloudflare, Vercel, Firebase 等
5. **Database**: PostgreSQL, MySQL, MongoDB, Redis, SQLite, DynamoDB 等
6. **DevOps**: Docker, Kubernetes, Terraform, GitHub Actions, Jenkins, Ansible 等
7. **Mobile**: React Native, Flutter, Swift, Kotlin, Expo 等
8. **Other**: Git, Linux, Vim, VSCode, Figma, Notion 等

## プロジェクト構成

```
techstack-share/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── share/[hash]/page.tsx
│   │   └── api/og/route.tsx
│   ├── components/
│   │   ├── tech-card.tsx
│   │   ├── tech-grid.tsx
│   │   ├── star-rating.tsx
│   │   ├── search-bar.tsx
│   │   ├── share-card.tsx
│   │   └── export-buttons.tsx
│   ├── data/
│   │   └── technologies.ts
│   └── lib/
│       ├── encoder.ts
│       └── utils.ts
├── public/
├── components.json
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```
