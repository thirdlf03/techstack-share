"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type LazyCategoryProps = {
  children: ReactNode;
  /** Estimated min-height (px) to reserve before content loads. */
  minHeight?: number;
};

export function LazyCategory({ children, minHeight = 120 }: LazyCategoryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasIO = typeof IntersectionObserver !== "undefined";
  const [visible, setVisible] = useState(!hasIO);

  useEffect(() => {
    if (!hasIO) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasIO]);

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  );
}
