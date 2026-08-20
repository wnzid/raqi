import { describe, expect, it, vi } from 'vitest';
import { createFamilySlug, createProductSlug, createUniqueSlug, normalizeProductSlug } from './product-slug';

describe('product slug generation', () => {
  it('creates family and colorway slugs from names', () => {
    expect(createFamilySlug('ASICS Gel-Kayano 30')).toBe('asics-gel-kayano-30');
    expect(createProductSlug('ASICS Gel-Kayano 30', 'Black / White')).toBe('asics-gel-kayano-30-black-white');
  });

  it('normalizes repeated spacing and punctuation', () => {
    expect(normalizeProductSlug('  Air   Max 90 / Premium  ')).toBe('air-max-90-premium');
  });

  it('adds the first available deterministic collision suffix', async () => {
    const exists = vi.fn((slug: string) => Promise.resolve(['runner-black', 'runner-black-2'].includes(slug)));
    await expect(createUniqueSlug('runner-black', exists)).resolves.toBe('runner-black-3');
  });
});
