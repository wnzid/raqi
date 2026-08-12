export type EcommerceEvent = 'view_item' | 'add_to_cart' | 'begin_checkout' | 'purchase';
export function analyticsEnabled(): boolean { return process.env.NODE_ENV === 'production' && Boolean(process.env.NEXT_PUBLIC_GTM_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID); }
export function trackEcommerceEvent(event: EcommerceEvent, data: Record<string, unknown>): void { if (!analyticsEnabled() || typeof window === 'undefined') return; const target = window as typeof window & { dataLayer?: unknown[] }; target.dataLayer ??= []; target.dataLayer.push({ event, ecommerce: data }); }
