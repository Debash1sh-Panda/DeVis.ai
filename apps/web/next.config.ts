import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Set turbopack root to monorepo root so pnpm-workspace.yaml is found
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },

  // API rewrites for local development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/:path*`,
      },
    ];
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
  },
};

export default nextConfig;
