import { describe, expect, it } from 'vitest';
import { checkoutSchema,deliveryFeeForDistrict,normalizeBangladeshPhone, orderConfirmationSchema, orderStatusSchema, paymentStatusSchema } from './order';
const contact = { name: 'Rafi Ahmed', email: 'rafi@example.com', phone: '+8801712345678' };
const shippingAddress = { recipientName: 'Rafi Ahmed', phone: '01712345678', addressLine: '12 Road 4', cityDistrict: 'Dhaka' };
const turnstileToken='test-token';
describe('checkout and order contracts', () => {
  it('normalizes Dhaka delivery pricing and charges the national rate elsewhere',()=>{for(const district of ['Dhaka','DHAKA','dhaka',' Dhaka '])expect(deliveryFeeForDistrict(district)).toBe(60);expect(deliveryFeeForDistrict('Chattogram')).toBe(120)});
  it('normalizes Bangladesh mobile forms and rejects invalid numbers',()=>{for(const value of ['01712345678','+8801712345678','8801712345678'])expect(normalizeBangladeshPhone(value)).toBe('+8801712345678');expect(normalizeBangladeshPhone('12345')).toBeNull()});
  it('requires Turnstile and Bangladesh shipping',()=>{expect(()=>checkoutSchema.parse({contact,shippingAddress})).toThrow();expect(()=>checkoutSchema.parse({contact,shippingAddress:{...shippingAddress,country:'US'},turnstileToken})).toThrow()});
  it('accepts guest checkout with an inline address', () => expect(checkoutSchema.parse({ contact, shippingAddress,turnstileToken })).toMatchObject({ shippingMethod: 'STANDARD', paymentMethod: 'CASH_ON_DELIVERY' }));
  it('accepts authenticated checkout with a saved address', () => expect(checkoutSchema.parse({ contact, savedAddressId: 'cm12345678901234567890123',turnstileToken })).toHaveProperty('savedAddressId'));
  it('rejects invalid email', () => expect(() => checkoutSchema.parse({ contact: { ...contact, email: 'bad' }, shippingAddress })).toThrow());
  it('requires exactly one address source', () => { expect(() => checkoutSchema.parse({ contact })).toThrow(); expect(() => checkoutSchema.parse({ contact, savedAddressId: 'cm12345678901234567890123', shippingAddress })).toThrow(); });
  it('defines narrow order and payment states', () => { expect(orderStatusSchema.parse('PENDING')).toBe('PENDING'); expect(paymentStatusSchema.parse('UNPAID')).toBe('UNPAID'); });
  it('accepts a safe confirmation response', () => expect(orderConfirmationSchema.parse({ orderNumber: 'RAQI-20260814-ABC12345', status: 'PENDING', paymentStatus: 'UNPAID', paymentMethod: 'CASH_ON_DELIVERY', currency: 'BDT', subtotal: 100, shippingAmount: 120, total: 220, createdAt: new Date().toISOString(), contact, shippingAddress: { ...shippingAddress, area: null, postalCode: null, country: 'BD' }, shippingMethod: { code: 'STANDARD', name: 'Standard delivery' }, items: [] })).toHaveProperty('total', 220));
});
