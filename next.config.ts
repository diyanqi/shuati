import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Prefix for static assets (/_next/*, build assets) to serve via CDN
  assetPrefix: "https://inkcraft-ti-assets.amzcd.top",
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
