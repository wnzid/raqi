import type { NextConfig } from 'next';
import path from 'node:path';

const monorepoRoot = path.resolve(process.cwd(), '../..');

// Next runs from apps/web, while this monorepo keeps its local secrets at the root.
// Existing process variables still win; this only supplies values that are absent.
if (!process.env.BETTER_AUTH_SECRET) {
  try { process.loadEnvFile(path.resolve(process.cwd(), '../../.env')); } catch { /* CI and deployments provide environment variables directly. */ }
}

const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').origin;

const nextConfig: NextConfig = {
  ...(process.env.NEXT_OUTPUT_MODE === 'standalone' ? { output: 'standalone' as const } : {}),
  outputFileTracingRoot: monorepoRoot,
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
  async headers(){const developmentEval=process.env.NODE_ENV==='development'?" 'unsafe-eval'":'';return[{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'no-referrer'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},{key:'Content-Security-Policy',value:`default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'${developmentEval} https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; connect-src 'self' ${apiOrigin} https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`}]}]}
};
export default nextConfig;
