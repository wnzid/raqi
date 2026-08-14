import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { AuthForm } from '@/components/auth/auth-form';
import { auth } from '@/lib/auth';
export default async function LoginPage() { if (await auth.api.getSession({ headers: await headers() })) redirect('/account'); return <Suspense><AuthForm mode="login" /></Suspense>; }
