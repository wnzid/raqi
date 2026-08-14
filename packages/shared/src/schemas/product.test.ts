import { describe, expect, it } from 'vitest';
import { createVariantSchema, productQuerySchema } from './product';

describe('catalog validation', () => {
  it('rejects negative variant inventory', () => expect(() => createVariantSchema.parse({ sku: 'SKU', colorId: 'cm12345678901234567890123', sizeEu: 42, stockQuantity: -1 })).toThrow());
  it('coerces pagination and combined filters', () => expect(productQuerySchema.parse({ page: '2', color: 'black', sizeEu: '42', inStock: 'true' })).toMatchObject({ page: 2, color: 'black', sizeEu: 42, inStock: true }));
  it('rejects an inverted price range', () => expect(() => productQuerySchema.parse({ minPrice: '200', maxPrice: '100' })).toThrow());
  it('accepts paginated storefront search', () => expect(productQuerySchema.parse({ q: 'RUN-42', page: '2' })).toMatchObject({ q: 'RUN-42', page: 2 }));
});
