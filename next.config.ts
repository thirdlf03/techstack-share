import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    webVitalsAttribution: ["CLS", "FCP", "INP", "LCP", "TTFB"],
  },
};

export default nextConfig;
