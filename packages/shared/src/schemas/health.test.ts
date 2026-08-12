import { describe, expect, it } from 'vitest';
import { healthResponseSchema } from './health';

describe('healthResponseSchema', () => {
  it('accepts the API health contract', () => {
    expect(healthResponseSchema.parse({ status: 'ok', service: 'api', timestamp: new Date().toISOString() }).status).toBe('ok');
  });
});
