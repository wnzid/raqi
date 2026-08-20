import { describe, expect, it } from 'vitest';
import { compareCatalogPrice, effectivePrice, variantAvailable } from './catalog.rules';
describe('catalog rules', () => {
  it('falls back to the product price', () => expect(effectivePrice(120, null, null)).toBe(120));
  it('uses the sale price', () => expect(effectivePrice(120, 90, null)).toBe(90));
  it('keeps the variant override authoritative', () => expect(effectivePrice(120, 90, 135)).toBe(135));
  it('sorts effective prices and breaks ties by newest then id',()=>{const older={price:3500,createdAt:new Date('2026-01-01'),id:'b'},newer={price:3500,createdAt:new Date('2026-02-01'),id:'a'},sale={price:1000,createdAt:new Date('2025-01-01'),id:'c'};expect([older,sale,newer].sort((a,b)=>compareCatalogPrice(a,b,'asc')).map(row=>row.id)).toEqual(['c','a','b']);expect([sale,older,newer].sort((a,b)=>compareCatalogPrice(a,b,'desc')).map(row=>row.id)).toEqual(['a','b','c'])});
  it('keeps out-of-stock inventory unavailable', () => expect(variantAvailable(true, 0)).toBe(false));
});
