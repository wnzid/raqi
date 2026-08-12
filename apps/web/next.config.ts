import type { NextConfig } from 'next';
const nextConfig: NextConfig = { transpilePackages: ['@footwear/shared'], images: { formats: ['image/avif', 'image/webp'], remotePatterns: [] } };
export default nextConfig;
