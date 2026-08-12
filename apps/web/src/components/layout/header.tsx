import Link from 'next/link';
export function Header() { return <header className="border-b"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"><Link className="font-semibold" href="/">Footwear</Link><nav aria-label="Primary"><Link className="text-sm text-neutral-600" href="/products">Products</Link></nav></div></header>; }
