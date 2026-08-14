import { headers } from 'next/headers';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { accountApi, checkoutApi } from '@/lib/api-client';
import { getServerCart } from '@/lib/server-cart';
export default async function CheckoutPage() { const incoming = await headers(); const init = { headers: { cookie: incoming.get('cookie') ?? '' } }; const [cart, methods, addresses] = await Promise.all([getServerCart(), checkoutApi.methods(init), accountApi.addresses(init).catch(() => [])]); return <CheckoutForm cart={cart} methods={methods} addresses={addresses} />; }
