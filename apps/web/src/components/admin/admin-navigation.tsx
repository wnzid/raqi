'use client';

import { Boxes, ExternalLink, FolderTree, Menu, Megaphone, PackageOpen, ScrollText, ShoppingBag, Store, Users, X, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

type NavigationItem = { label: string; href: string; icon: LucideIcon; superAdminOnly?: boolean };
type NavigationGroup = { label: string; items: NavigationItem[] };

const navigation: NavigationGroup[] = [
  { label: 'MAIN', items: [{ label: 'Overview', href: '/admin', icon: Store }, { label: 'Orders', href: '/admin/orders', icon: PackageOpen }] },
  { label: 'CATALOG', items: [{ label: 'Products', href: '/admin/products', icon: ShoppingBag }, { label: 'Inventory', href: '/admin/inventory', icon: Boxes }, { label: 'Brands', href: '/admin/brands', icon: FolderTree }] },
  { label: 'STORE', items: [{ label: 'Announcements', href: '/admin/announcement', icon: Megaphone }] },
  { label: 'MANAGEMENT', items: [{ label: 'Users', href: '/admin/users', icon: Users, superAdminOnly: true }, { label: 'Activity', href: '/admin/activity', icon: ScrollText, superAdminOnly: true }] },
];

function isActiveRoute(pathname: string, href: string) {
  return href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function Navigation({ superAdmin, close }: { superAdmin: boolean; close?: () => void }) {
  const pathname = usePathname();
  return <nav className="space-y-5" aria-label="Admin navigation">{navigation.map((group) => {
    const items = group.items.filter((item) => !item.superAdminOnly || superAdmin);
    if (!items.length) return null;
    return <section key={group.label} aria-labelledby={`admin-nav-${group.label.toLowerCase()}`}><h2 className="mb-1.5 px-3 text-[10px] font-semibold tracking-[.16em] text-neutral-500" id={`admin-nav-${group.label.toLowerCase()}`}>{group.label}</h2><div className="grid gap-0.5">{items.map(({ label, href, icon: Icon }) => {
      const active = isActiveRoute(pathname, href);
      return <Link {...(active ? { 'aria-current': 'page' as const } : {})} {...(close ? { onClick: close } : {})} className={`relative flex h-11 items-center border-l-2 px-3 text-sm transition-colors ${active ? 'border-white bg-white/[.09] font-medium text-white' : 'border-transparent text-neutral-400 hover:bg-white/[.06] hover:text-white'}`} href={href} key={href}><span className="flex items-center gap-3"><Icon aria-hidden="true" size={19} strokeWidth={active ? 2.1 : 1.8} /><span>{label}</span></span></Link>;
    })}</div></section>;
  })}</nav>;
}

function StorefrontLink({ close }: { close?: () => void }) {
  return <Link {...(close ? { onClick: close } : {})} className="flex h-11 items-center border-t border-white/10 px-3 pt-3 text-sm text-neutral-400 transition-colors hover:text-white" href="/"><span className="flex items-center gap-3"><ExternalLink aria-hidden="true" size={18} /><span>View storefront</span></span></Link>;
}

export function AdminNavigation({ superAdmin }: { superAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!open) return; document.body.style.overflow = 'hidden'; closeButton.current?.focus(); const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); }; window.addEventListener('keydown', escape); return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', escape); }; }, [open]);
  return <><aside className="hidden min-h-screen flex-col bg-[#191917] px-4 py-5 text-white lg:flex"><Link className="mb-7 block px-3 py-2 text-sm font-semibold tracking-[.2em]" href="/admin">RAQI ADMIN</Link><Navigation superAdmin={superAdmin} /><div className="mt-auto pt-8"><StorefrontLink /></div></aside><header className="flex h-16 items-center justify-between border-b border-[var(--line)] bg-white px-4 lg:hidden"><Link className="text-sm font-semibold tracking-[.18em]" href="/admin">RAQI ADMIN</Link><button className="icon-button" onClick={() => setOpen(true)} aria-label="Open admin menu"><Menu size={20} /></button></header>{open && <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu"><button className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} aria-label="Close admin menu" /><aside className="relative flex h-full w-[min(16rem,88vw)] flex-col bg-[#191917] px-4 py-5 text-white"><div className="mb-7 flex items-center justify-between px-3 py-1"><span className="text-sm font-semibold tracking-[.18em]">RAQI ADMIN</span><button ref={closeButton} className="icon-button border-white/20 text-white" onClick={() => setOpen(false)} aria-label="Close admin menu"><X size={19} /></button></div><div className="min-h-0 flex-1 overflow-y-auto"><Navigation superAdmin={superAdmin} close={() => setOpen(false)} /></div><div className="pt-6"><StorefrontLink close={() => setOpen(false)} /></div></aside></div>}</>;
}
