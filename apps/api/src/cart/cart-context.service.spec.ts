import { describe, expect, it, vi } from 'vitest';
import { auth } from '../auth/auth';
import { CartContextService, GUEST_CART_COOKIE } from './cart-context.service';
vi.mock('../auth/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
describe('CartContextService', () => {
  it('creates a secure opaque guest identity lazily and resolves it on reload', async () => { vi.mocked(auth.api.getSession).mockResolvedValue(null); const cookie = vi.fn(); const service = new CartContextService(); const first = await service.resolve({ headers: {} } as never, { cookie } as never, true); expect(first.guestTokenHash).toHaveLength(64); const raw = cookie.mock.calls[0]?.[1] as string; expect(raw).not.toBe(first.guestTokenHash); const second = await service.resolve({ headers: { cookie: `${GUEST_CART_COOKIE}=${raw}` } } as never, { cookie: vi.fn() } as never); expect(second).toEqual(first); });
  it('prefers the authenticated customer while retaining guest identity for merge', async () => { vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'user-1', isActive: true }, session: {} } as never); const context = await new CartContextService().resolve({ headers: { cookie: `${GUEST_CART_COOKIE}=opaque-token` } } as never, {} as never); expect(context.userId).toBe('user-1'); expect(context.guestTokenHash).toHaveLength(64); });
});
