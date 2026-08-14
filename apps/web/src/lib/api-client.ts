import { accountSchema, addressSchema, cartSchema, healthResponseSchema, orderConfirmationSchema, orderDetailSchema, orderHistorySchema, productDetailSchema, productListResponseSchema, shippingMethodSchema, type AddCartItemInput, type CheckoutInput, type CreateAddressInput, type CustomerAccount, type CustomerAddress, type GuestOrderLookupInput, type HealthResponse, type OrderConfirmation, type OrderDetail, type OrderSummary, type ProductDetail, type ProductListResponse, type ShippingMethod, type ShoppingCart, type UpdateAddressInput, type UpdateCartItemInput, type UpdateProfileInput } from '@footwear/shared';
import { publicEnvironment } from './env';

export class ApiError extends Error { constructor(public readonly status: number, message: string) { super(message); this.name = 'ApiError'; } }
async function apiRequest<T>(path: string, parse: (data: unknown) => T, init?: RequestInit): Promise<T> {
  const response = await fetch(`${publicEnvironment.NEXT_PUBLIC_API_URL}${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) throw new ApiError(response.status, `API request failed (${response.status})`);
  return parse(response.status === 204 ? undefined : await response.json());
}
export const api = { health: (): Promise<HealthResponse> => apiRequest('/health', (value) => healthResponseSchema.parse(value)) };
export async function listProducts(searchParams: Record<string, string | number | boolean | undefined> = {}): Promise<ProductListResponse> { const query = new URLSearchParams(Object.entries(searchParams).filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined).map(([key, value]) => [key, String(value)])); return apiRequest(`/products?${query}`, (value) => productListResponseSchema.parse(value), { next: { revalidate: 60 } }); }
export async function getProduct(slug: string): Promise<ProductDetail> { return apiRequest(`/products/slug/${encodeURIComponent(slug)}`, (value) => productDetailSchema.parse(value), { next: { revalidate: 60 } }); }
export const accountApi = {
  get: (init?: RequestInit): Promise<CustomerAccount> => apiRequest('/account', (value) => accountSchema.parse(value), { cache: 'no-store', ...init }),
  update: (input: UpdateProfileInput): Promise<CustomerAccount> => apiRequest('/account', (value) => accountSchema.parse(value), { method: 'PATCH', body: JSON.stringify(input) }),
  addresses: (init?: RequestInit): Promise<CustomerAddress[]> => apiRequest('/account/addresses', (value) => addressSchema.array().parse(value), { cache: 'no-store', ...init }),
  createAddress: (input: CreateAddressInput): Promise<CustomerAddress> => apiRequest('/account/addresses', (value) => addressSchema.parse(value), { method: 'POST', body: JSON.stringify(input) }),
  updateAddress: (id: string, input: UpdateAddressInput): Promise<CustomerAddress> => apiRequest(`/account/addresses/${encodeURIComponent(id)}`, (value) => addressSchema.parse(value), { method: 'PATCH', body: JSON.stringify(input) }),
  deleteAddress: (id: string): Promise<void> => apiRequest(`/account/addresses/${encodeURIComponent(id)}`, () => undefined, { method: 'DELETE' }),
};
export const cartApi = {
  get: (init?: RequestInit): Promise<ShoppingCart> => apiRequest('/cart', (value) => cartSchema.parse(value), { cache: 'no-store', ...init }),
  add: (input: AddCartItemInput): Promise<ShoppingCart> => apiRequest('/cart/items', (value) => cartSchema.parse(value), { method: 'POST', body: JSON.stringify(input) }),
  update: (itemId: string, input: UpdateCartItemInput): Promise<ShoppingCart> => apiRequest(`/cart/items/${encodeURIComponent(itemId)}`, (value) => cartSchema.parse(value), { method: 'PATCH', body: JSON.stringify(input) }),
  remove: (itemId: string): Promise<ShoppingCart> => apiRequest(`/cart/items/${encodeURIComponent(itemId)}`, (value) => cartSchema.parse(value), { method: 'DELETE' }),
  clear: (): Promise<void> => apiRequest('/cart', () => undefined, { method: 'DELETE' }),
  merge: (): Promise<ShoppingCart> => apiRequest('/cart/merge', (value) => cartSchema.parse(value), { method: 'POST' }),
};
export const checkoutApi = {
  methods: (init?: RequestInit): Promise<ShippingMethod[]> => apiRequest('/checkout/shipping-methods', (value) => shippingMethodSchema.array().parse(value), { cache: 'no-store', ...init }),
  place: (input: CheckoutInput): Promise<OrderConfirmation> => apiRequest('/checkout', (value) => orderConfirmationSchema.parse(value), { method: 'POST', body: JSON.stringify(input) }),
};
export const ordersApi = {
  list: (init?: RequestInit): Promise<{ data: OrderSummary[] }> => apiRequest('/orders', (value) => orderHistorySchema.parse(value), { cache: 'no-store', ...init }),
  get: (orderNumber: string, init?: RequestInit): Promise<OrderDetail> => apiRequest(`/orders/${encodeURIComponent(orderNumber)}`, (value) => orderDetailSchema.parse(value), { cache: 'no-store', ...init }),
  guest: (input: GuestOrderLookupInput): Promise<OrderDetail> => apiRequest('/orders/guest/lookup', (value) => orderDetailSchema.parse(value), { method: 'POST', body: JSON.stringify(input), cache: 'no-store' }),
};
