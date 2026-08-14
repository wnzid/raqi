import { describe, expect, it } from 'vitest';
import { cartVariantSellable, mergedCartQuantity } from './cart.rules';
describe('cart rules', () => {
  it('requires active product, active variant, and stock', () => { expect(cartVariantSellable(true, true, 2)).toBe(true); expect(cartVariantSellable(false, true, 2)).toBe(false); expect(cartVariantSellable(true, false, 2)).toBe(false); expect(cartVariantSellable(true, true, 0)).toBe(false); });
  it('combines duplicate merge lines', () => expect(mergedCartQuantity(2, 1, 5)).toBe(3));
  it('caps a merged line at current stock', () => expect(mergedCartQuantity(4, 3, 5)).toBe(5));
});
