import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Prevent eslint package version mismatches in CI/Vercel from blocking production builds
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
