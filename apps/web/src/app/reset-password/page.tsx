import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export default function ResetPasswordPage() {
  return <Suspense fallback={<section className="container page"><p className="muted">Loading…</p></section>}><ResetPasswordForm /></Suspense>;
}
