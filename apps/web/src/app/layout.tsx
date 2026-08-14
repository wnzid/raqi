import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import './globals.css';

export const metadata: Metadata = { title:{ default:'RAQI — Modern footwear for every day', template:'%s | RAQI' }, description:'Contemporary footwear designed for everyday movement. Shop RAQI shoes with delivery across Bangladesh.' };
export default function RootLayout({ children }:Readonly<{ children:ReactNode }>) { return <html lang="en"><body><Providers><div className="flex min-h-screen flex-col"><Header /><main className="flex-1">{children}</main><Footer /></div></Providers></body></html>; }
