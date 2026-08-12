import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './specs', fullyParallel: true, use: { baseURL: process.env.WEB_URL ?? 'http://localhost:3000', trace: 'on-first-retry' }, webServer: { command: 'corepack pnpm --filter @footwear/web dev', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI } });
