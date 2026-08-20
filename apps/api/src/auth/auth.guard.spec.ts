import { ForbiddenException, UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminGuard } from './admin.guard';
import { auth } from './auth';
import { AuthGuard } from './auth.guard';

vi.mock('./auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
const context = (request: Record<string, unknown>) => ({ switchToHttp: () => ({ getRequest: () => request }) }) as ExecutionContext;

describe('authentication and authorization guards', () => {
  beforeEach(() => vi.clearAllMocks());
  it('rejects an unauthenticated request', async () => { vi.mocked(auth.api.getSession).mockResolvedValue(null); await expect(new AuthGuard().canActivate(context({ headers: {} }))).rejects.toBeInstanceOf(UnauthorizedException); });
  it('attaches a safe authenticated customer', async () => { vi.mocked(auth.api.getSession).mockResolvedValue({ session: {} as never, user: { id: 'user-1', email: 'customer@example.com', name: 'Customer', role: 'CUSTOMER', isActive: true } } as never); const request: Record<string, unknown> = { headers: {} }; await expect(new AuthGuard().canActivate(context(request))).resolves.toBe(true); expect(request.user).toMatchObject({ id: 'user-1', role: 'CUSTOMER' }); });
  it('forbids customers at the admin boundary', () => expect(() => new AdminGuard().canActivate(context({ user: { role: 'CUSTOMER' } }))).toThrow(ForbiddenException));
  it('allows managers and super admins at the operational boundary', () => { expect(new AdminGuard().canActivate(context({ user: { role: 'MANAGER' } }))).toBe(true); expect(new AdminGuard().canActivate(context({ user: { role: 'SUPER_ADMIN' } }))).toBe(true); });
});
