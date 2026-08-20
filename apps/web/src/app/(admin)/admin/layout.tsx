import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminNavigation } from '@/components/admin/admin-navigation';
import { AdminToastProvider } from '@/components/admin/toast';
import { auth, authPrisma } from '@/lib/auth';

export default async function AdminLayout({children}:{children:ReactNode}) {
  const session=await auth.api.getSession({headers:await headers()});
  if(!session) redirect('/login?returnTo=/admin');
  const user=await authPrisma.user.findUnique({where:{id:session.user.id},select:{role:true,isActive:true}});
  if(!user?.isActive) redirect('/login');
  if(!['MANAGER','SUPER_ADMIN'].includes(user.role)) notFound();
  return <AdminToastProvider><div className="admin-shell min-h-screen bg-[#f6f6f3] lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]"><AdminNavigation superAdmin={user.role==='SUPER_ADMIN'}/><main className="min-w-0 p-4 sm:p-7 lg:p-10">{children}</main></div></AdminToastProvider>;
}
