import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import './globals.css';

export const metadata: Metadata = { title: { default: 'Footwear', template: '%s | Footwear' }, description: 'A modern footwear storefront.' };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body><Providers><div className="flex min-h-screen flex-col"><Header /><main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main><Footer /></div></Providers></body></html>;
}
