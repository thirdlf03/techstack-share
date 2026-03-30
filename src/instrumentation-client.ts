import { reportPerf } from "@/lib/perf";

type LargestContentfulPaintEntry = PerformanceEntry & {
  element?: Element | null;
  id?: string;
  loadTime?: number;
  renderTime?: number;
  size?: number;
  url?: string;
};

type LayoutShiftEntry = PerformanceEntry & {
  hadRecentInput: boolean;
  sources?: Array<{ node?: Element | null }>;
  value: number;
};

type LongTaskEntry = PerformanceEntry & {
  attribution?: unknown;
};

function observePerformanceEntries<T extends PerformanceEntry>(
  label: string,
  options: PerformanceObserverInit,
  onEntry: (entry: T) => void,
) {
  if (typeof PerformanceObserver === "undefined") {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        onEntry(entry as T);
      }
    });

    observer.observe(options);
  } catch (error) {
    reportPerf("performance-observer-error", {
      error: error instanceof Error ? error.message : String(error),
      label,
    });
  }
}

reportPerf("instrumentation-client-init");

observePerformanceEntries<PerformanceNavigationTiming>(
  "navigation",
  { type: "navigation", buffered: true },
  (entry) => {
    reportPerf("navigation", {
      domComplete: entry.domComplete,
      domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
      loadEventEnd: entry.loadEventEnd,
      redirectCount: entry.redirectCount,
      responseEnd: entry.responseEnd,
      transferSize: entry.transferSize,
      type: entry.type,
    });
  },
);

observePerformanceEntries<PerformancePaintTiming>("paint", { type: "paint", buffered: true }, (entry) => {
  reportPerf("paint", {
    name: entry.name,
    startTime: entry.startTime,
  });
});

observePerformanceEntries<LargestContentfulPaintEntry>(
  "largest-contentful-paint",
  { type: "largest-contentful-paint", buffered: true },
  (entry) => {
    reportPerf("lcp-candidate", {
      element: entry.element,
      id: entry.id,
      loadTime: entry.loadTime,
      renderTime: entry.renderTime,
      size: entry.size,
      startTime: entry.startTime,
      url: entry.url,
    });
  },
);

observePerformanceEntries<LayoutShiftEntry>(
  "layout-shift",
  { type: "layout-shift", buffered: true },
  (entry) => {
    if (entry.hadRecentInput) {
      return;
    }

    reportPerf("layout-shift", {
      sources: entry.sources?.map((source) => source.node),
      startTime: entry.startTime,
      value: entry.value,
    });
  },
);

observePerformanceEntries<PerformanceResourceTiming>(
  "resource",
  { type: "resource", buffered: true },
  (entry) => {
    const isThirdParty = typeof window !== "undefined" && !entry.name.startsWith(window.location.origin);

    if (!isThirdParty && entry.duration < 100 && entry.initiatorType !== "font") {
      return;
    }

    reportPerf("resource", {
      decodedBodySize: entry.decodedBodySize,
      duration: entry.duration,
      encodedBodySize: entry.encodedBodySize,
      initiatorType: entry.initiatorType,
      name: entry.name,
      nextHopProtocol: entry.nextHopProtocol,
      renderBlockingStatus:
        "renderBlockingStatus" in entry ? entry.renderBlockingStatus : undefined,
      responseEnd: entry.responseEnd,
      transferSize: entry.transferSize,
    });
  },
);

observePerformanceEntries<LongTaskEntry>("longtask", { type: "longtask", buffered: true }, (entry) => {
  reportPerf("long-task", {
    attribution: entry.attribution,
    duration: entry.duration,
    name: entry.name,
    startTime: entry.startTime,
  });
});

export function onRouterTransitionStart(
  url: string,
  navigationType: "push" | "replace" | "traverse",
) {
  reportPerf("router-transition-start", { navigationType, url });
}
