'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { authClient } from '@/lib/auth-client';

const confirmation = 'If an account exists for this email, a reset link has been sent.';

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const data = new FormData(event.currentTarget);
    try {
      await authClient.requestPasswordReset({
        email: String(data.get('email')).trim(),
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } finally {
      setPending(false);
      setSubmitted(true);
    }
  }

  return <section className="container page"><div className="mx-auto max-w-md"><p className="eyebrow">Your RAQI</p><h1 className="title mt-4">Forgot password?</h1><p className="mt-4 leading-6 muted">Enter your account email and we’ll send a secure reset link.</p>{submitted ? <div className="mt-8"><p className="border border-neutral-200 bg-[var(--soft)] p-4 text-sm leading-6" role="status">{confirmation}</p><Link className="mt-6 inline-block text-sm font-semibold underline" href="/login">Back to login</Link></div> : <form className="mt-8 space-y-4" onSubmit={submit}><label className="label">Email<input className="field" name="email" type="email" required autoComplete="email" /></label><button className="button w-full" disabled={pending}>{pending ? 'Sending…' : 'Send reset link'}</button></form>}</div></section>;
}
