import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
  serverExternalPackages: ['@prisma/client', 'prisma'], // ✅ updated key
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
