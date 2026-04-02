import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    webVitalsAttribution: ["CLS", "FCP", "INP", "LCP", "TTFB"],
  },
  async rewrites() {
    return [
      {
        source: "/share/:hash.md",
        destination: "/api/share-md/:hash",
      },
    ];
  },
};

export default nextConfig;
