import { describe, expect, it } from 'vitest';
import { ApiError } from './api-client';
describe('ApiError', () => { it('retains the response status', () => { expect(new ApiError(503, 'unavailable').status).toBe(503); }); });
