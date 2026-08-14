'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { cartApi } from '@/lib/api-client';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter(); const search = useSearchParams(); const [error, setError] = useState(''); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(''); const data = new FormData(event.currentTarget);
    const email = String(data.get('email')); const password = String(data.get('password'));
    if (mode === 'register' && password !== String(data.get('confirmPassword'))) { setError('Passwords do not match.'); setPending(false); return; }
    const result = mode === 'login'
      ? await authClient.signIn.email({ email, password })
      : await authClient.signUp.email({ email, password, name: String(data.get('name')).trim() });
    if (result.error) { setError(mode === 'login' ? 'Invalid email or password.' : result.error.message ?? 'Registration failed.'); setPending(false); return; }
    try { await cartApi.merge(); } catch { /* Authentication succeeded; the persisted guest cart can be merged on the next authentication transition. */ }
    router.push(search.get('returnTo')?.startsWith('/') ? search.get('returnTo')! : '/account'); router.refresh();
  }
  return <form className="mx-auto max-w-md space-y-4" onSubmit={submit}><h1 className="text-2xl font-semibold">{mode === 'login' ? 'Log in' : 'Create account'}</h1>
    {mode === 'register' && <label className="block text-sm">Name<input className="mt-1 w-full rounded border p-2" name="name" required minLength={2} autoComplete="name" /></label>}
    <label className="block text-sm">Email<input className="mt-1 w-full rounded border p-2" name="email" type="email" required autoComplete="email" /></label>
    <label className="block text-sm">Password<input className="mt-1 w-full rounded border p-2" name="password" type="password" required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
    {mode === 'register' && <label className="block text-sm">Confirm password<input className="mt-1 w-full rounded border p-2" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" /></label>}
    {error && <p className="text-sm text-red-700" role="alert">{error}</p>}<button className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50" disabled={pending}>{pending ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}</button>
    <p className="text-sm">{mode === 'login' ? <>New to RAQI? <Link className="underline" href="/register">Register</Link></> : <>Already registered? <Link className="underline" href="/login">Log in</Link></>}</p></form>;
}
