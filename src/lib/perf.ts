"use client";

type PerfPayload =
  | string
  | number
  | boolean
  | null
  | undefined
  | PerfPayload[]
  | { [key: string]: PerfPayload };

type PerfEvent = {
  detail?: PerfPayload;
  href: string;
  name: string;
  ts: number;
};

declare global {
  interface Window {
    __TECHSTACK_PERF__?: PerfEvent[];
  }
}

function round(value: number) {
  return Number(value.toFixed(2));
}

function describeElement(element: Element) {
  const id = element.id ? `#${element.id}` : "";
  const classNames =
    element.classList.length > 0
      ? `.${Array.from(element.classList)
          .slice(0, 3)
          .join(".")}`
      : "";

  return `${element.tagName.toLowerCase()}${id}${classNames}`;
}

function sanitizeValue(value: unknown, depth = 0): PerfPayload {
  if (value == null) {
    return value as null | undefined;
  }

  if (typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? round(value) : String(value);
  }

  if (value instanceof Element) {
    return describeElement(value);
  }

  if (value instanceof PerformanceEntry) {
    return {
      duration: round(value.duration),
      entryType: value.entryType,
      name: value.name,
      startTime: round(value.startTime),
    };
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeValue(item, depth + 1));
  }

  if (typeof value === "object") {
    if (depth >= 4) {
      return "[max-depth]";
    }

    const output: Record<string, PerfPayload> = {};

    for (const [key, nestedValue] of Object.entries(value).slice(0, 30)) {
      output[key] = sanitizeValue(nestedValue, depth + 1);
    }

    return output;
  }

  return String(value);
}

function canMeasure() {
  return typeof window !== "undefined" && typeof performance !== "undefined";
}

export function reportPerf(name: string, detail?: unknown) {
  if (!canMeasure()) {
    return;
  }

  const event: PerfEvent = {
    detail: detail === undefined ? undefined : sanitizeValue(detail),
    href: window.location.href,
    name,
    ts: round(performance.now()),
  };

  window.__TECHSTACK_PERF__ ??= [];
  window.__TECHSTACK_PERF__.push(event);
  console.debug("[perf]", event);
}

export function startPerfMark(label: string, detail?: unknown) {
  if (!canMeasure()) {
    return;
  }

  performance.mark(`${label}:start`);
  reportPerf(`${label}:start`, detail);
}

export function endPerfMark(label: string, detail?: unknown) {
  if (!canMeasure()) {
    return;
  }

  const startMark = `${label}:start`;
  const endMark = `${label}:end`;

  if (performance.getEntriesByName(startMark, "mark").length === 0) {
    return;
  }

  performance.mark(endMark);
  performance.measure(label, startMark, endMark);

  const measure = performance.getEntriesByName(label, "measure").at(-1);

  reportPerf(label, {
    duration: measure?.duration ?? null,
    ...((detail ?? {}) as Record<string, unknown>),
  });

  performance.clearMarks(startMark);
  performance.clearMarks(endMark);
  performance.clearMeasures(label);
}

export function reportMeasured<T>(label: string, detail: Record<string, unknown>, fn: () => T) {
  if (!canMeasure()) {
    return fn();
  }

  const startedAt = performance.now();

  try {
    return fn();
  } finally {
    reportPerf(label, {
      ...detail,
      duration: performance.now() - startedAt,
    });
  }
}
