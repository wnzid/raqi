import { headers } from 'next/headers';
import { cartApi } from './api-client';
export async function getServerCart() { const incoming = await headers(); return cartApi.get({ headers: { cookie: incoming.get('cookie') ?? '' } }); }
