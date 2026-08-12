'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
export function ApiStatus() { const health = useQuery({ queryKey: ['health'], queryFn: api.health, retry: 1 }); return <p className="text-sm text-neutral-500" role="status">API: {health.isPending ? 'checking…' : health.isSuccess ? 'connected' : 'unavailable'}</p>; }
