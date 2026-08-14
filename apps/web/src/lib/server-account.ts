import { headers } from 'next/headers';
import { accountApi } from './api-client';

export async function getServerAccount() { const incoming = await headers(); return accountApi.get({ headers: { cookie: incoming.get('cookie') ?? '' } }); }
