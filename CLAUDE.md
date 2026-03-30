# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm test         # Vitest in watch mode
pnpm test:run     # Vitest single run
pnpm vitest run src/lib/encoder.test.ts  # Run a single test file
```

Regenerate the icon registry after changing `src/data/technologies.ts`:

```bash
node --experimental-strip-types scripts/generate-tech-icons.mjs
```

## Architecture

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + pnpm. UI components from shadcn (@base-ui/react).

### Core Data Flow

`TechStack` = `Record<string, number>` mapping technology IDs (e.g. `"ts"`, `"react"`) to proficiency ratings (1–5). This type is the central data structure used everywhere.

**Encoding/sharing** (`src/lib/encoder.ts`): `TechStack` → JSON → pako deflate → base64url. This hash appears in share URLs (`/share/[hash]`) and the OG image endpoint (`/api/og?data=[hash]`).

**Grouping** (`src/lib/share-card.ts`): `groupTechStack()` groups a `TechStack` by rating level (5=Expert → 1=Learning) for display in share cards and exports.

### Routes

- `/` — Main page (client component). Users search/filter technologies, set star ratings, preview their card, copy share link, or export as PNG.
- `/share/[hash]` — Server component. Decodes the hash, renders the share card, and generates OGP metadata pointing to `/api/og`.
- `/api/og` — Edge route. Generates a 1200×630 OGP image using `next/og` (ImageResponse) with a bundled Geist font (`route.tsx` → `assets/Geist-Regular.ttf`).

### Icon System

Technology icons are **not** loaded from CDN. They are fetched at build-script time and inlined as SVG strings:

1. `src/data/technologies.ts` — master list of technologies with `deviconClass` identifiers.
2. `scripts/generate-tech-icons.mjs` — fetches SVGs from Devicon/Simple Icons repos, normalizes them, writes `src/data/tech-icons.generated.ts`.
3. `src/lib/technology-icons.ts` — runtime helpers: `getTechnologyIconMarkup()` (raw SVG string), `getTechnologyIconDataUrl()` (data URI for `<img>`), `loadTechnologyIconImage()` (browser Image element for Canvas).
4. `src/components/technology-icon.tsx` — React component that renders the SVG via `dangerouslySetInnerHTML`.

### Image Export

Two separate rendering paths produce visually similar output:

- **Client-side PNG** (`src/lib/export-image.ts`): Canvas 2D API, triggered by the "画像で保存" button. Dynamic height based on content.
- **OG image** (`src/app/api/og/route.tsx`): `next/og` ImageResponse (Satori), fixed 1200×630. Runs on Edge runtime.

Both use local assets only — no remote fetches at render time.

### Performance Instrumentation

`src/lib/perf.ts` provides `startPerfMark`/`endPerfMark`/`reportPerf` for client-side performance tracking. `src/instrumentation-client.ts` hooks into Web Vitals. `RenderProfiler` wraps React Profiler for component render timing.
