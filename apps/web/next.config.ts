import type { NextConfig } from 'next';
import path from 'node:path';

// Next runs from apps/web, while this monorepo keeps its local secrets at the root.
// Existing process variables still win; this only supplies values that are absent.
if (!process.env.BETTER_AUTH_SECRET) {
  try { process.loadEnvFile(path.resolve(process.cwd(), '../../.env')); } catch { /* CI and deployments provide environment variables directly. */ }
}

const nextConfig: NextConfig = {
  transpilePackages: ['@footwear/shared'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-06cf47b7b82b416989f845babe03411b.r2.dev',
        pathname: '/products/**',
      },
    ],
  },
};
export default nextConfig;
