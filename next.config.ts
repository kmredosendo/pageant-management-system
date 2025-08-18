import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/pageant/:path*',   // incoming request from Apache
        destination: '/:path*',    // map to root of Next.js app
      },
    ];
  },
};

export default nextConfig;
