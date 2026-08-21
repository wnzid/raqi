import { ConflictException } from '@nestjs/common';
import { Prisma } from '@footwear/database';
import { describe, expect, it, vi } from 'vitest';
import { AdminCatalogService } from './admin-catalog.service';

const actor = { id: 'admin', name: 'Admin', email: 'admin@raqi.dev', role: 'SUPER_ADMIN' } as never;

describe('AdminCatalogService brand creation', () => {
  it('maps only Prisma unique constraint failures to a conflict', async () => {
    const duplicate = new Prisma.PrismaClientKnownRequestError('duplicate', { code: 'P2002', clientVersion: '6.15.0' });
    const prisma = { brand: { create: vi.fn().mockRejectedValue(duplicate) } };
    const service = new AdminCatalogService(prisma as never, { write: vi.fn() } as never);
    await expect(service.brand(actor, { name: 'Nike', slug: 'nike' })).rejects.toEqual(expect.any(ConflictException));
    await expect(service.brand(actor, { name: 'Nike', slug: 'nike' })).rejects.toMatchObject({ message: 'A brand with this name already exists.' });
  });

  it('does not disguise unrelated database failures as conflicts', async () => {
    const failure = new Error('database unavailable');
    const prisma = { brand: { create: vi.fn().mockRejectedValue(failure) } };
    const service = new AdminCatalogService(prisma as never, { write: vi.fn() } as never);
    await expect(service.brand(actor, { name: 'Nike', slug: 'nike' })).rejects.toBe(failure);
  });
});
