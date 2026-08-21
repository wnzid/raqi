import { describe, expect, it } from 'vitest';
import { createOrderNumber } from './order-number';

describe('createOrderNumber', () => {
  it('uses the compact RAQI-YYMMDD-XXXXXX format', () => {
    expect(createOrderNumber(new Date('2026-08-20T12:00:00.000Z'))).toMatch(/^RAQI-260820-[A-HJ-NP-Z2-9]{6}$/);
  });

  it('generates varying suffixes', () => {
    const values = new Set(Array.from({ length: 20 }, () => createOrderNumber(new Date('2026-08-20T12:00:00.000Z'))));
    expect(values.size).toBeGreaterThan(1);
  });
});
