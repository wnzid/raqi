import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth, authPrisma } from '@/lib/auth';
export default async function AdminPage() { const session = await auth.api.getSession({ headers: await headers() }); if (!session) redirect('/login?returnTo=/admin'); const user = await authPrisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, isActive: true } }); if (!user?.isActive) redirect('/login'); if (user.role !== 'ADMIN') notFound(); return <h1 className="text-2xl font-semibold">Administration</h1>; }
