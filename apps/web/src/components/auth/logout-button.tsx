'use client';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
export function LogoutButton() { const router = useRouter(); return <button className="text-sm underline" onClick={async () => { await authClient.signOut(); router.push('/'); router.refresh(); }}>Log out</button>; }
