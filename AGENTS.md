<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Repo Notes

- Do not reintroduce the external Devicon CDN CSS or font files. Technology icons are bundled locally.
- The canonical generated icon registry is `src/data/tech-icons.generated.ts`.
- If you change `src/data/technologies.ts` icon variants or the icon sourcing logic, regenerate icons with `node --experimental-strip-types scripts/generate-tech-icons.mjs`.
- Prefer Devicon `original` variants when available. Keep `plain` only for technologies that do not ship an `original` SVG.
- Keep OG and export rendering on local assets; avoid remote font or icon fetches in `src/app/api/og/route.tsx` and export code paths.
