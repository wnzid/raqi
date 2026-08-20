import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { SiteShell } from '@/components/layout/site-shell';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'RAQI | Modern footwear for every day', template: '%s | RAQI' },
  description: 'Contemporary footwear designed for everyday movement. Shop RAQI shoes with delivery across Bangladesh.',
  icons: {
    icon: [{ url: '/favicon.ico?v=2', type: 'image/x-icon', sizes: 'any' }],
    shortcut: '/favicon.ico?v=2',
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body><Providers><SiteShell header={<Header />} footer={<Footer />}>{children}</SiteShell></Providers></body></html>;
}
