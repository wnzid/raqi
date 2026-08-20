'use client';

import { FormEvent, useState } from 'react';
import { authClient } from '@/lib/auth-client';

export function ChangePasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const newPassword = String(data.get('newPassword'));
    if (newPassword !== String(data.get('confirmPassword'))) {
      setError('New passwords do not match.');
      return;
    }
    setPending(true);
    const result = await authClient.changePassword({
      currentPassword: String(data.get('currentPassword')),
      newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);
    if (result.error) {
      setError('The current password is incorrect, or the new password is not valid.');
      return;
    }
    form.reset();
    setMessage('Your password has been changed. Other sessions have been signed out.');
  }

  return <section className="container page"><p className="eyebrow">Your RAQI</p><h1 className="title mt-4">Password</h1><p className="mt-3 muted">Change your password and secure your account.</p><form className="mt-9 max-w-xl space-y-4" onSubmit={submit}><label className="label">Current password<input className="field" name="currentPassword" type="password" required autoComplete="current-password" /></label><label className="label">New password<input className="field" name="newPassword" type="password" required minLength={8} autoComplete="new-password" /></label><label className="label">Confirm new password<input className="field" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" /></label>{error && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}{message && <p className="text-sm" role="status">{message}</p>}<button className="button" disabled={pending}>{pending ? 'Changing…' : 'Change password'}</button></form></section>;
}
