"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type LazyCategoryProps = {
  children: ReactNode;
  /** Estimated min-height (px) to reserve before content loads. */
  minHeight?: number;
};

export function LazyCategory({ children, minHeight = 120 }: LazyCategoryProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Always start false to match SSR output and avoid hydration mismatch.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      // Test environment (jsdom) — render immediately.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- environment fallback, not cascading render
      setVisible(true);
      return;
    }

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
  }, []);

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  );
}
