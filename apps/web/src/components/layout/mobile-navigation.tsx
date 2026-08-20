'use client';

import { Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { CartCount } from '../cart/cart-count';

const links = [{ href: '/products', label: 'Shop all' }, { href: '/products?gender=MEN', label: 'Men' }, { href: '/products?gender=WOMEN', label: 'Women' }, { href: '/products?newArrival=true', label: 'New arrivals' }, { href: '/account', label: 'Account' }, { href: '/account/orders', label: 'Orders' }];

export function MobileNavigation({ cartQuantity }: { cartQuantity: number }) {
  const [open, setOpen] = useState(false); const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!open) return; const prior = document.body.style.overflow; document.body.style.overflow = 'hidden'; closeRef.current?.focus(); const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); }; document.addEventListener('keydown', key); return () => { document.body.style.overflow = prior; document.removeEventListener('keydown', key); }; }, [open]);
  return <div className="flex w-full items-center justify-between md:hidden">
    <button className="icon-button -ml-2" type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={21} /></button>
    <Link className="absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-[.24em]" href="/" aria-label="RAQI home">RAQI</Link>
    <div className="flex items-center"><Link className="icon-button" href="/search" aria-label="Search"><Search size={19} /></Link><CartCount initial={cartQuantity} mobile/></div>
    {open && <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Navigation menu"><button className="absolute inset-0 bg-black/35" type="button" aria-label="Close navigation" onClick={() => setOpen(false)} /><div className="relative flex h-full w-[min(86vw,22rem)] flex-col bg-white p-5 shadow-xl"><div className="flex items-center justify-between border-b border-[var(--line)] pb-4"><strong className="tracking-[.18em]">RAQI</strong><button ref={closeRef} className="icon-button" type="button" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20} /></button></div><nav className="mt-5 grid" aria-label="Mobile navigation">{links.map((link) => <Link className="border-b border-[var(--line)] py-4 text-lg font-medium" href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}</nav><Link className="button mt-auto w-full" href="/products" onClick={() => setOpen(false)}>Shop footwear</Link></div></div>}
  </div>;
}
