import { describe, expect, it } from 'vitest';
import { addCartItemSchema, cartSchema, updateCartItemSchema } from './cart';
const variantId = 'cm12345678901234567890123';
describe('cart contracts', () => {
  it('accepts a selected variant and quantity', () => expect(addCartItemSchema.parse({ variantId, quantity: 2 })).toEqual({ variantId, quantity: 2 }));
  it.each([0, -1, 1.5])('rejects invalid quantity %s', (quantity) => expect(() => addCartItemSchema.parse({ variantId, quantity })).toThrow());
  it('accepts a positive update quantity', () => expect(updateCartItemSchema.parse({ quantity: 3 })).toEqual({ quantity: 3 }));
  it('accepts an empty server cart response', () => expect(cartSchema.parse({ items: [], subtotal: 0, totalQuantity: 0 })).toEqual({ items: [], subtotal: 0, totalQuantity: 0 }));
});
