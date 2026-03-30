import { criticalIconSvgs } from "@/data/tech-icons-critical.generated";

const FALLBACK_ICON_SVG =
  '<svg preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#E2E8F0"/><path d="M7.5 8.5h9v2h-9zm0 5h9v2h-9z" fill="#475569"/></svg>';

const dataUrlCache = new Map<string, string>();
const imageCache = new Map<string, Promise<HTMLImageElement>>();

/** Deferred icons merged after dynamic import resolves. */
let deferredIcons: Record<string, string> = {};
let deferredLoaded = false;

/** Kick off the deferred icon load (client-side). Safe to call multiple times. */
export function preloadDeferredIcons(): void {
  if (deferredLoaded) return;
  deferredLoaded = true;
  import("@/data/tech-icons-deferred.generated").then((mod) => {
    deferredIcons = mod.deferredIconSvgs;
  });
}

/** Register deferred icons synchronously (for server-side routes like OG). */
export function registerDeferredIcons(icons: Record<string, string>): void {
  deferredIcons = icons;
  deferredLoaded = true;
}

function getIconSvg(id: string): string | null {
  return criticalIconSvgs[id] ?? deferredIcons[id] ?? null;
}

export function getTechnologyIconMarkup(id: string): string {
  return getIconSvg(id) ?? FALLBACK_ICON_SVG;
}

export function getTechnologyIconDataUrl(id: string): string {
  const cached = dataUrlCache.get(id);
  if (cached) {
    return cached;
  }

  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(getTechnologyIconMarkup(id))}`;
  dataUrlCache.set(id, dataUrl);
  return dataUrl;
}

export function loadTechnologyIconImage(id: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(id);
  if (cached) {
    return cached;
  }

  const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to decode icon for ${id}`));
    image.src = getTechnologyIconDataUrl(id);
  });

  imageCache.set(id, imagePromise);
  return imagePromise;
}
