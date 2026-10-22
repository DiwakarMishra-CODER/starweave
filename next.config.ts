import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only Cover Art Archive covers go through the optimiser — it is slow and
  // flaky to fetch from directly (see lib/image-url.ts). Every other image
  // host resizes by URL and is served straight from its own CDN. A cover
  // never changes, so the optimised copy is kept for a month.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'coverartarchive.org', pathname: '/release/**' }],
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }],
      },
    ];
  },
};

export default nextConfig;
