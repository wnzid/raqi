import { headers } from 'next/headers';
import { AnnouncementForm } from '@/components/admin/announcement-form';
import { announcementAdminApi } from '@/lib/admin-api';

export default async function Page() {
  const incoming = await headers();
  const announcement = await announcementAdminApi.get({ headers: { cookie: incoming.get('cookie') ?? '' }, cache: 'no-store' });
  return <section><p className="eyebrow">Storefront</p><h1 className="title mt-3">Announcement banner</h1><p className="mt-3 max-w-2xl muted">Publish one concise message beneath the RAQI header immediately or during a scheduled window.</p><AnnouncementForm initial={announcement} /></section>;
}
