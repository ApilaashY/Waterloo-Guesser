import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  // Silence Turbopack warning by acknowledging we're using webpack customization
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Exclude test files from webpack compilation
    config.module.rules.push({
      test: /\/(vitest|playwright)\.config\.ts$/,
      use: 'ignore-loader'
    });

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
