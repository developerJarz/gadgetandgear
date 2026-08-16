import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow static image imports from src/assets
  images: {
    remotePatterns: [],
  },
  // Enable experimental features
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
