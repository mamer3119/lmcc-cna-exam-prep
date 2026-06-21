import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/lmcc-cna-exam-prep",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.modules.push(path.join(__dirname, "node_modules"));
    return config;
  },
};

export default nextConfig;
