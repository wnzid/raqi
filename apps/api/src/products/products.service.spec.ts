/* eslint-disable @typescript-eslint/require-await */
import { describe, expect, it, vi } from 'vitest';
import { ProductsService } from './products.service';

const actor = { id: 'actor', name: 'Admin', email: 'admin@raqi.dev', role: 'SUPER_ADMIN' } as never;
const variant = (sku: string, sizeEu: number, stockQuantity: number) => ({ sku, sizeEu, stockQuantity, isActive: true });

describe('ProductsService.createFamily', () => {
  it('generates family and colorway slugs while preserving returned IDs', async () => {
    const creates: Array<{ slug: string; colorId: string; variants: { create: unknown[] } }> = [];
    const tx = {
      productFamily: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn(({ data }: { data: { name: string; slug: string } }) => Promise.resolve({ id: 'family', ...data })),
      },
      color: { findFirst: vi.fn(({ where }: { where: { id: string } }) => Promise.resolve({ id: where.id, name: where.id === 'black' ? 'Black' : 'White' })) },
      product: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn(({ data }: { data: { slug: string; colorId: string; variants: { create: unknown[] } } }) => {
          creates.push(data);
          return Promise.resolve({ id: `${data.colorId}-product`, colorId: data.colorId, title: `ASICS Gel-Kayano 30 | ${data.colorId}`, slug: data.slug });
        }),
      },
    };
    const prisma = {
      brand: { findFirst: vi.fn().mockResolvedValue({ id: 'brand' }) },
      $transaction: vi.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
    };
    const service = new ProductsService(prisma as never, { write: vi.fn() } as never, { remove: vi.fn() } as never);
    const result = await service.createFamily(actor, {
      name: 'ASICS Gel-Kayano 30', description: 'Comfort', brandId: 'brand',
      colorways: [
        { colorId: 'black', basePrice: 3500, isActive: true, variants: [variant('B40', 40, 5), variant('B41', 41, 8)] },
        { colorId: 'white', basePrice: 3500, isActive: true, variants: [variant('W40', 40, 3)] },
      ],
    });
    expect(tx.productFamily.create).toHaveBeenCalledWith({ data: { name: 'ASICS Gel-Kayano 30', slug: 'asics-gel-kayano-30' } });
    expect(creates.map((item) => item.slug)).toEqual(['asics-gel-kayano-30-black', 'asics-gel-kayano-30-white']);
    expect(creates.map((item) => item.variants.create.length)).toEqual([2, 1]);
    expect(result.products.map((product) => [product.colorId, product.id, product.slug])).toEqual([
      ['black', 'black-product', 'asics-gel-kayano-30-black'],
      ['white', 'white-product', 'asics-gel-kayano-30-white'],
    ]);
  });

  it('adds a deterministic suffix for a genuine family and product collision', async () => {
    const tx = {
      productFamily: {
        findUnique: vi.fn(({ where }: { where: { slug: string } }) => Promise.resolve(where.slug === 'runner' ? { id: 'occupied' } : null)),
        create: vi.fn(({ data }: { data: { name: string; slug: string } }) => Promise.resolve({ id: 'family', ...data })),
      },
      color: { findFirst: vi.fn().mockResolvedValue({ id: 'black', name: 'Black' }) },
      product: {
        findUnique: vi.fn(({ where }: { where: { slug: string } }) => Promise.resolve(where.slug === 'runner-black' ? { id: 'occupied' } : null)),
        create: vi.fn(({ data }: { data: { slug: string } }) => Promise.resolve({ id: 'product', ...data })),
      },
    };
    const prisma = { brand: { findFirst: vi.fn().mockResolvedValue({ id: 'brand' }) }, $transaction: vi.fn((callback: (client: typeof tx) => unknown) => callback(tx)) };
    const service = new ProductsService(prisma as never, { write: vi.fn() } as never, { remove: vi.fn() } as never);
    const result = await service.createFamily(actor, { name: 'Runner', description: '', brandId: 'brand', colorways: [{ colorId: 'black', basePrice: 100, isActive: false, variants: [variant('R40', 40, 0)] }] });
    expect(result.family.slug).toBe('runner-2');
    expect(result.products[0]?.slug).toBe('runner-black-2');
  });
});

describe('permanent product deletion', () => {
  it('removes every family media object before deleting products and the family', async () => {
    const events: string[] = [];
    const tx = { product: { deleteMany: vi.fn(async () => { events.push('products'); }) }, productFamily: { delete: vi.fn(async () => { events.push('family'); }) } };
    const prisma = { productFamily: { findUnique: vi.fn().mockResolvedValue({ id: 'family', name: 'Runner', products: [{ id: 'black', media: [{ objectKey: 'black/front.webp' }, { objectKey: 'black/side.webp' }] }, { id: 'white', media: [{ objectKey: 'white/front.webp' }] }] }) }, $transaction: vi.fn((callback: (client: typeof tx) => unknown) => callback(tx)) };
    const storage = { remove: vi.fn(async (key: string) => { events.push(key); }) };
    const audit = { write: vi.fn(async () => { events.push('audit'); }) };
    const service = new ProductsService(prisma as never, audit as never, storage as never);
    await service.deleteFamily(actor, 'family');
    expect(storage.remove).toHaveBeenCalledTimes(3);
    expect(events.slice(0, 3).sort()).toEqual(['black/front.webp', 'black/side.webp', 'white/front.webp']);
    expect(tx.product.deleteMany).toHaveBeenCalledWith({ where: { familyId: 'family' } });
    expect(audit.write).toHaveBeenCalledWith(actor, 'PRODUCT_DELETED', 'ProductFamily', 'family', { name: 'Runner' }, tx);
  });

  it('deletes only the selected colorway when siblings remain', async () => {
    const tx = { product: { delete: vi.fn() } };
    const prisma = { product: { findUnique: vi.fn().mockResolvedValue({ id: 'white', family: { id: 'family', name: 'Runner', _count: { products: 3 } }, color: { name: 'White' }, media: [{ objectKey: 'white/front.webp' }] }) }, $transaction: vi.fn((callback: (client: typeof tx) => unknown) => callback(tx)) };
    const storage = { remove: vi.fn() }; const audit = { write: vi.fn() };
    const service = new ProductsService(prisma as never, audit as never, storage as never);
    await service.deleteColorway(actor, 'white');
    expect(tx.product.delete).toHaveBeenCalledWith({ where: { id: 'white' } });
    expect(storage.remove).toHaveBeenCalledWith('white/front.webp');
  });

  it('retains database records when object removal fails', async () => {
    const prisma = { productFamily: { findUnique: vi.fn().mockResolvedValue({ id: 'family', name: 'Runner', products: [{ id: 'black', media: [{ objectKey: 'broken.webp' }] }] }) }, $transaction: vi.fn() };
    const service = new ProductsService(prisma as never, { write: vi.fn() } as never, { remove: vi.fn().mockRejectedValue(new Error('R2 unavailable')) } as never);
    await expect(service.deleteFamily(actor, 'family')).rejects.toThrow('Database records were retained');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
