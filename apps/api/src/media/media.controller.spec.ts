import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { MediaController } from './media.controller';

const actor = { id: 'admin', name: 'Admin', email: 'admin@raqi.dev', role: 'SUPER_ADMIN' } as never;

describe('MediaController reorder', () => {
  it('moves the selected image to zero and normalizes all positions transactionally', async () => {
    const update = vi.fn().mockResolvedValue({});
    const tx = { productMedia: { update } };
    const prisma = {
      productMedia: { findMany: vi.fn().mockResolvedValue([{ id: 'first' }, { id: 'second' }, { id: 'third' }]) },
      $transaction: vi.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
    };
    const audit = { write: vi.fn() };
    const controller = new MediaController({} as never, prisma as never, audit as never);
    await expect(controller.reorder(actor, 'product', { items: [
      { id: 'third', position: 0 }, { id: 'first', position: 1 }, { id: 'second', position: 2 },
    ] })).resolves.toEqual({ updated: 3 });
    expect(update.mock.calls.map(([operation]) => operation.data)).toEqual([
      { position: -1, isPrimary: false }, { position: -2, isPrimary: false }, { position: -3, isPrimary: false },
      { position: 0, isPrimary: true }, { position: 1, isPrimary: false }, { position: 2, isPrimary: false },
    ]);
    expect(audit.write).toHaveBeenCalledWith(actor, 'MEDIA_REORDERED', 'Product', 'product', { count: 3, primaryMediaId: 'third' });
  });

  it('rejects incomplete reorder requests', async () => {
    const prisma = { productMedia: { findMany: vi.fn().mockResolvedValue([{ id: 'first' }, { id: 'second' }]) } };
    const controller = new MediaController({} as never, prisma as never, {} as never);
    await expect(controller.reorder(actor, 'product', { items: [{ id: 'first', position: 0 }] })).rejects.toEqual(expect.any(BadRequestException));
  });
});
