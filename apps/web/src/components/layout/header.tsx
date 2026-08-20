import { Search, UserRound } from 'lucide-react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getActiveAnnouncement } from '@/lib/api-client';
import { getServerCart } from '@/lib/server-cart';
import { AnnouncementBanner } from './announcement-banner';
import { MobileNavigation } from './mobile-navigation';
import { CartCount } from '../cart/cart-count';

const links = [{ href: '/products', label: 'Shop all' }, { href: '/products?gender=MEN', label: 'Men' }, { href: '/products?gender=WOMEN', label: 'Women' }, { href: '/products?newArrival=true', label: 'New arrivals' }];

export async function Header() {
  const incoming = await headers();
  const [session, cart, announcement] = await Promise.all([
    auth.api.getSession({ headers: incoming }),
    getServerCart().catch(() => ({ items: [], subtotal: 0, totalQuantity: 0 })),
    getActiveAnnouncement().catch(() => null),
  ]);
  return <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white">
    <div className="container relative flex h-16 items-center justify-between gap-5 md:h-[4.25rem]">
      <MobileNavigation cartQuantity={cart.totalQuantity} />
      <Link className="hidden text-xl font-bold tracking-[.24em] md:block" href="/" aria-label="RAQI home">RAQI</Link>
      <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Primary">{links.map((link) => <Link className="transition-colors hover:text-[var(--muted)]" href={link.href} key={link.label}>{link.label}</Link>)}</nav>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Customer actions"><Link className="icon-button" href="/search" aria-label="Search"><Search size={19} /></Link><Link className="icon-button" href={session ? '/account' : '/login'} aria-label={session ? 'Account' : 'Log in'}><UserRound size={19} /></Link><CartCount initial={cart.totalQuantity}/></nav>
    </div>
    <AnnouncementBanner announcement={announcement} />
  </header>;
}
