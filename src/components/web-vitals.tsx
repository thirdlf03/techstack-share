"use client";

import { useReportWebVitals } from "next/web-vitals";
import { reportPerf } from "@/lib/perf";

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

const handleWebVitals: ReportWebVitalsCallback = (metric) => {
  reportPerf("web-vital", {
    delta: metric.delta,
    entries: metric.entries,
    id: metric.id,
    name: metric.name,
    navigationType: metric.navigationType,
    rating: metric.rating,
    value: metric.value,
    // Attribution is available when `experimental.webVitalsAttribution` is enabled.
    ...(typeof metric === "object" && metric !== null && "attribution" in metric
      ? { attribution: metric.attribution }
      : {}),
  });
};

export function WebVitals() {
  useReportWebVitals(handleWebVitals);

  return null;
}
