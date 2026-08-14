import { CartView } from '@/components/cart/cart-view';
import { getServerCart } from '@/lib/server-cart';
export default async function CartPage() { const cart = await getServerCart(); return <CartView initial={cart} />; }
