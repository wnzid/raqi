import { randomInt } from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createOrderNumber(now = new Date()): string {
  const date = now.toISOString().slice(2, 10).replaceAll('-', '');
  const suffix = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
  return `RAQI-${date}-${suffix}`;
}
