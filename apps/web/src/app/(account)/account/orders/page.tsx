import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ordersApi } from '@/lib/api-client';
export default async function OrdersPage() { const incoming = await headers(); if (!await auth.api.getSession({ headers: incoming })) redirect('/login?returnTo=/account/orders'); const orders = await ordersApi.list({ headers: { cookie: incoming.get('cookie') ?? '' } }); return <section className="space-y-4"><h1 className="text-2xl font-semibold">Orders</h1>{orders.data.length ? <ul className="divide-y">{orders.data.map((order) => <li className="flex justify-between py-4" key={order.orderNumber}><div><Link className="font-medium underline" href={`/account/orders/${order.orderNumber}`}>{order.orderNumber}</Link><p className="text-sm text-neutral-600">{new Date(order.createdAt).toLocaleDateString()} · {order.status} · {order.paymentStatus}</p></div><span>{order.total.toFixed(2)} BDT</span></li>)}</ul> : <p className="text-neutral-600">You have not placed any orders yet.</p>}</section>; }
