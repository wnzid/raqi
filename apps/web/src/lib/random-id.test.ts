import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserRandomId, secureRandomUuid } from './random-id';

const originalCrypto = globalThis.crypto;

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: originalCrypto });
});

describe('browserRandomId', () => {
  it('falls back when randomUUID is unavailable', () => {
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {} });
    vi.spyOn(Date, 'now').mockReturnValue(123);
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.25).mockReturnValueOnce(0.5);
    expect(browserRandomId()).toMatch(/^123-[a-z0-9]+-[a-z0-9]+$/);
  });
});

describe('secureRandomUuid', () => {
  it('uses secure random bytes to produce a UUID v4 when randomUUID is unavailable', () => {
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { getRandomValues: (bytes: Uint8Array) => bytes.fill(0xab) } });
    expect(secureRandomUuid()).toBe('abababab-abab-4bab-abab-abababababab');
  });

  it('throws instead of using an insecure fallback', () => {
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {} });
    expect(() => secureRandomUuid()).toThrow('Secure random generation is unavailable.');
  });
});
