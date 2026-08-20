'use client';
import { type ReactNode, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const visitedStorefrontRoutes=new Set<string>();
const FOCUS_FRESHNESS_MS=60_000;

export function SiteShell({ children, header, footer }: { children: ReactNode; header: ReactNode; footer: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const lastRefreshAt = useRef(Date.now());
  useEffect(()=>{
    if(pathname.startsWith('/admin'))return;
    if(visitedStorefrontRoutes.has(pathname)){router.refresh();lastRefreshAt.current=Date.now()}
    visitedStorefrontRoutes.add(pathname);
  },[pathname,router]);
  useEffect(()=>{
    const refreshWhenStale=()=>{if(document.visibilityState==='visible'&&!pathname.startsWith('/admin')&&Date.now()-lastRefreshAt.current>=FOCUS_FRESHNESS_MS){lastRefreshAt.current=Date.now();router.refresh()}};
    document.addEventListener('visibilitychange',refreshWhenStale);
    return()=>document.removeEventListener('visibilitychange',refreshWhenStale);
  },[pathname,router]);
  if (pathname.startsWith('/admin')) return <main className="min-h-screen">{children}</main>;
  return <div className="flex min-h-screen flex-col">{header}<main className="flex-1">{children}</main>{footer}</div>;
}
