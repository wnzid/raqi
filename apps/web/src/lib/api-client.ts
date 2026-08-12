import { healthResponseSchema, type HealthResponse } from '@footwear/shared';
import { publicEnvironment } from './env';

export class ApiError extends Error { constructor(public readonly status: number, message: string) { super(message); this.name = 'ApiError'; } }
async function apiRequest<T>(path: string, parse: (data: unknown) => T, init?: RequestInit): Promise<T> {
  const response = await fetch(`${publicEnvironment.NEXT_PUBLIC_API_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) throw new ApiError(response.status, `API request failed (${response.status})`);
  return parse(await response.json());
}
export const api = { health: (): Promise<HealthResponse> => apiRequest('/health', (value) => healthResponseSchema.parse(value)) };
