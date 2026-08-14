import { describe, expect, it } from 'vitest';
import { checkoutSchema, orderConfirmationSchema, orderStatusSchema, paymentStatusSchema } from './order';
const contact = { name: 'Rafi Ahmed', email: 'rafi@example.com', phone: '+8801712345678' };
const shippingAddress = { recipientName: 'Rafi Ahmed', phone: '01712345678', addressLine: '12 Road 4', cityDistrict: 'Dhaka' };
describe('checkout and order contracts', () => {
  it('accepts guest checkout with an inline address', () => expect(checkoutSchema.parse({ contact, shippingAddress })).toMatchObject({ shippingMethod: 'STANDARD', paymentMethod: 'CASH_ON_DELIVERY' }));
  it('accepts authenticated checkout with a saved address', () => expect(checkoutSchema.parse({ contact, savedAddressId: 'cm12345678901234567890123' })).toHaveProperty('savedAddressId'));
  it('rejects invalid email', () => expect(() => checkoutSchema.parse({ contact: { ...contact, email: 'bad' }, shippingAddress })).toThrow());
  it('requires exactly one address source', () => { expect(() => checkoutSchema.parse({ contact })).toThrow(); expect(() => checkoutSchema.parse({ contact, savedAddressId: 'cm12345678901234567890123', shippingAddress })).toThrow(); });
  it('defines narrow order and payment states', () => { expect(orderStatusSchema.parse('PENDING')).toBe('PENDING'); expect(paymentStatusSchema.parse('UNPAID')).toBe('UNPAID'); });
  it('accepts a safe confirmation response', () => expect(orderConfirmationSchema.parse({ orderNumber: 'RAQI-20260814-ABC12345', status: 'PENDING', paymentStatus: 'UNPAID', paymentMethod: 'CASH_ON_DELIVERY', currency: 'BDT', subtotal: 100, shippingAmount: 120, total: 220, createdAt: new Date().toISOString(), contact, shippingAddress: { ...shippingAddress, area: null, postalCode: null, country: 'BD' }, shippingMethod: { code: 'STANDARD', name: 'Standard delivery' }, items: [] })).toHaveProperty('total', 220));
});
