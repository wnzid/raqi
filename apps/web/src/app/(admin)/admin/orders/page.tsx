import type { OrderStatus } from '@footwear/database';
import { Search } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { AdminOrderList } from '@/components/admin/admin-order-list';
import { adminApi } from '@/lib/admin-api';

const statuses: Array<{ label: string; value?: OrderStatus }> = [{ label: 'All' }, { label: 'Pending', value: 'PENDING' }, { label: 'Confirmed', value: 'CONFIRMED' }, { label: 'Processing', value: 'PROCESSING' }, { label: 'Shipped', value: 'SHIPPED' }, { label: 'Delivered', value: 'DELIVERED' }, { label: 'Cancelled', value: 'CANCELLED' }];
const validStatuses = new Set(statuses.flatMap((item) => item.value ? [item.value] : []));
const validSorts = new Set(['newest', 'oldest', 'total_desc', 'total_asc']);

type SearchParams = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = await searchParams;
  const q = one(raw.q)?.trim() ?? '';
  const statusValue = one(raw.status);
  const status = validStatuses.has(statusValue as OrderStatus) ? statusValue as OrderStatus : undefined;
  const sortValue = one(raw.sort) ?? 'newest';
  const sort = validSorts.has(sortValue) ? sortValue : 'newest';
  const dateFrom = one(raw.dateFrom) ?? '';
  const dateTo = one(raw.dateTo) ?? '';
  const page = Math.max(1, Number(one(raw.page)) || 1);
  const requestHeaders = await headers();
  const result = await adminApi.orders({ q: q || undefined, status, sort, dateFrom: dateFrom ? `${dateFrom}T00:00:00.000Z` : undefined, dateTo: dateTo ? `${dateTo}T23:59:59.999Z` : undefined, page }, { headers: { cookie: requestHeaders.get('cookie') ?? '' } });
  const allCount = Object.values(result.statusCounts).reduce((sum, count) => sum + count, 0);
  const preserved = { ...(q ? { q } : {}), ...(dateFrom ? { dateFrom } : {}), ...(dateTo ? { dateTo } : {}), ...(sort !== 'newest' ? { sort } : {}) };
  const href = (changes: Record<string, string | number | undefined>) => { const query = new URLSearchParams(); for (const [key, value] of Object.entries({ ...preserved, ...(status ? { status } : {}), ...changes })) if (value !== undefined && value !== '') query.set(key, String(value)); return `/admin/orders${query.size ? `?${query}` : ''}`; };

  return <section><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Fulfillment</p><h1 className="title mt-3">Orders</h1><p className="mt-2 text-sm muted">{result.pagination.total} matching {result.pagination.total === 1 ? 'order' : 'orders'}</p></div></div><nav className="mt-7 flex gap-1 overflow-x-auto border-b border-[var(--line)]" aria-label="Order status filters">{statuses.map((item) => { const active = item.value ? status === item.value : !status; const count = item.value ? result.statusCounts[item.value] : allCount; return <Link aria-current={active ? 'page' : undefined} className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${active ? 'border-black text-black' : 'border-transparent text-neutral-500 hover:bg-neutral-100 hover:text-black'}`} href={href({ status: item.value, page: undefined })} key={item.label}>{item.label}<span className="ml-1.5 text-[10px] text-neutral-500">{count}</span></Link>; })}</nav><form className="grid gap-2 border-x border-b border-[var(--line)] bg-white p-3 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_9rem_9rem_11rem_auto]" action="/admin/orders"><label className="relative sm:col-span-2 xl:col-span-1"><span className="sr-only">Search orders</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} /><input className="field h-10 pl-9" name="q" defaultValue={q} placeholder="Order, customer, phone or email" /></label><label><span className="sr-only">From date</span><input className="field h-10" type="date" name="dateFrom" defaultValue={dateFrom} aria-label="From date" /></label><label><span className="sr-only">To date</span><input className="field h-10" type="date" name="dateTo" defaultValue={dateTo} aria-label="To date" /></label><label><span className="sr-only">Sort orders</span><select className="field h-10" name="sort" defaultValue={sort} aria-label="Sort orders"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="total_desc">Highest total</option><option value="total_asc">Lowest total</option></select></label>{status && <input type="hidden" name="status" value={status} />}<div className="flex gap-2"><button className="button h-10 px-4" type="submit">Apply</button>{(q || dateFrom || dateTo || sort !== 'newest') && <Link className="button secondary h-10 px-4" href={status ? `/admin/orders?status=${status}` : '/admin/orders'}>Clear</Link>}</div></form><div className="mt-4"><AdminOrderList orders={result.data} /></div>{result.pagination.totalPages > 1 && <nav className="mt-4 flex items-center justify-between border border-[var(--line)] bg-white px-3 py-2 text-sm" aria-label="Order pages"><Link className={`font-semibold underline ${page <= 1 ? 'pointer-events-none opacity-30' : ''}`} href={href({ page: page - 1 })}>Previous</Link><span className="muted">Page {page} of {result.pagination.totalPages}</span><Link className={`font-semibold underline ${page >= result.pagination.totalPages ? 'pointer-events-none opacity-30' : ''}`} href={href({ page: page + 1 })}>Next</Link></nav>}</section>;
}
