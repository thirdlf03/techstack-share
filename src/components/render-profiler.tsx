"use client";

import { Profiler, type ReactNode } from "react";
import { reportPerf } from "@/lib/perf";

type RenderProfilerProps = {
  children: ReactNode;
  id: string;
};

export function RenderProfiler({ children, id }: RenderProfilerProps) {
  return (
    <Profiler
      id={id}
      onRender={(profilerId, phase, actualDuration, baseDuration, startTime, commitTime) => {
        reportPerf("react-render", {
          actualDuration,
          baseDuration,
          commitTime,
          id: profilerId,
          phase,
          startTime,
        });
      }}
    >
      {children}
    </Profiler>
  );
}
