import { describe, expect, it } from 'vitest';
import { effectivePrice, variantAvailable } from './catalog.rules';
describe('catalog rules', () => {
  it('falls back to the product price', () => expect(effectivePrice(120, null)).toBe(120));
  it('uses the variant override', () => expect(effectivePrice(120, 135)).toBe(135));
  it('keeps out-of-stock inventory unavailable', () => expect(variantAvailable(true, 0)).toBe(false));
});
