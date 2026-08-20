import { KeyRound, MapPin, Package, UserRound } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { LogoutButton } from '@/components/auth/logout-button';
import { auth } from '@/lib/auth';
import { getServerAccount } from '@/lib/server-account';

const items = [
  { href: '/account/profile', title: 'Profile', copy: 'Keep your personal details up to date.', icon: UserRound },
  { href: '/account/addresses', title: 'Addresses', copy: 'Manage delivery addresses for checkout.', icon: MapPin },
  { href: '/account/orders', title: 'Orders', copy: 'Review current and previous orders.', icon: Package },
  { href: '/account/security', title: 'Password', copy: 'Change your password and secure your account.', icon: KeyRound },
];

export default async function AccountPage() {
  if (!await auth.api.getSession({ headers: await headers() })) redirect('/login?returnTo=/account');
  const account = await getServerAccount();
  return <section className="container page"><p className="eyebrow">Your RAQI</p><h1 className="title mt-4">Hello, {account.profile.firstName ?? account.name.split(' ')[0]}.</h1><p className="mt-3 muted">{account.email}</p><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{items.map((item) => <Link className="panel group" href={item.href} key={item.title}><item.icon size={22} /><h2 className="mt-8 text-lg font-semibold group-hover:underline">{item.title}</h2><p className="mt-2 text-sm leading-6 muted">{item.copy}</p></Link>)}</div><div className="mt-8"><LogoutButton /></div></section>;
}
