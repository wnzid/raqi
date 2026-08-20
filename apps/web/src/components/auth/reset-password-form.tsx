'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export function ResetPasswordForm() {
  const search = useSearchParams();
  const token = search.get('token');
  const invalidLink = !token || Boolean(search.get('error'));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setError('');
    const data = new FormData(event.currentTarget);
    const newPassword = String(data.get('newPassword'));
    if (newPassword !== String(data.get('confirmPassword'))) {
      setError('Passwords do not match.');
      return;
    }
    setPending(true);
    const result = await authClient.resetPassword({ newPassword, token });
    setPending(false);
    if (result.error) {
      setError('This reset link is invalid or has expired. Request a new one.');
      return;
    }
    setComplete(true);
  }

  return <section className="container page"><div className="mx-auto max-w-md"><p className="eyebrow">Your RAQI</p><h1 className="title mt-4">Reset password</h1>{invalidLink ? <div className="mt-8"><p className="border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">This reset link is invalid or has expired.</p><Link className="mt-6 inline-block text-sm font-semibold underline" href="/forgot-password">Request a new link</Link></div> : complete ? <div className="mt-8"><p className="border border-neutral-200 bg-[var(--soft)] p-4 text-sm" role="status">Your password has been reset. You can now log in.</p><Link className="button mt-6 inline-flex" href="/login">Log in</Link></div> : <form className="mt-8 space-y-4" onSubmit={submit}><label className="label">New password<input className="field" name="newPassword" type="password" required minLength={8} autoComplete="new-password" /></label><label className="label">Confirm password<input className="field" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" /></label>{error && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}<button className="button w-full" disabled={pending}>{pending ? 'Resetting…' : 'Reset password'}</button></form>}</div></section>;
}
