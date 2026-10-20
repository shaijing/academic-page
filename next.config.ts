import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
if (basePath && !/^\/[A-Za-z0-9._-]+$/.test(basePath)) {
  throw new Error('NEXT_PUBLIC_BASE_PATH must be a single path segment such as /PRISM');
}

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  images: {
    unoptimized: true,
  },
  /* config options here */
  webpack: (config) => {
    config.module.rules.push({
      test: /\.bib$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
