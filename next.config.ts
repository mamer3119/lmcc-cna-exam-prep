import type { NextConfig } from "next";

const basePath = "/lmcc-cna-exam-prep";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: `${basePath}/`,
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
