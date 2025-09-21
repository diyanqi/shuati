import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  // 在生产环境通过 CDN 提供静态资源前缀；开发环境不使用前缀，便于本地调试
  ...(isProd ? { assetPrefix: "https://inkcraft-ti-assets.amzcd.top" } : {}),
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
