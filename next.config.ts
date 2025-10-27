import type { NextConfig } from "next";

// Validate environment variables at build time
import './lib/env';

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Add any remote image domains if needed
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
