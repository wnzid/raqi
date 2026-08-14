import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { LogoutButton } from '@/components/auth/logout-button';
import { auth } from '@/lib/auth';
import { getServerAccount } from '@/lib/server-account';
export default async function AccountPage() { if (!await auth.api.getSession({ headers: await headers() })) redirect('/login?returnTo=/account'); const account = await getServerAccount(); return <section className="space-y-5"><h1 className="text-2xl font-semibold">Your account</h1><div><p className="font-medium">{account.name}</p><p className="text-sm text-neutral-600">{account.email}</p></div><nav className="flex gap-4"><Link className="underline" href="/account/profile">Profile</Link><Link className="underline" href="/account/addresses">Addresses</Link><Link className="underline" href="/account/orders">Orders</Link></nav><LogoutButton /></section>; }
