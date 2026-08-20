import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@footwear/database';
import { describe, expect, it, vi } from 'vitest';
import { InvoiceService } from './invoice.service';

const confirmedOrder = {
  id: 'order-id', orderNumber: 'RAQI-000123', userId: 'customer-1', status: 'CONFIRMED', paymentStatus: 'UNPAID', paymentMethod: 'CASH_ON_DELIVERY', currency: 'BDT', subtotal: new Prisma.Decimal(8500), shippingAmount: new Prisma.Decimal(60), total: new Prisma.Decimal(8560), contactName: 'Customer Name', contactEmail: 'customer@example.com', contactPhone: '01700000000', shippingRecipient: 'Recipient Name', shippingPhone: '01800000000', shippingAddressLine: '12 Test Road', shippingArea: 'Dhanmondi', shippingCityDistrict: 'Dhaka', shippingPostalCode: '1209', shippingCountry: 'BD', shippingMethodCode: 'STANDARD', shippingMethodName: 'Standard delivery', guestAccessTokenHash: null, createdAt: new Date('2026-08-01T10:00:00Z'), updatedAt: new Date('2026-08-02T10:00:00Z'), confirmedAt: new Date('2026-08-02T10:00:00Z'),
  items: [{ id: 'item-1', orderId: 'order-id', productId: 'old-product', variantId: 'old-variant', productName: 'Saved Runner Snapshot', productSlug: 'saved-runner', sku: 'RUN-BLK-42', colorName: 'Black', sizeEu: new Prisma.Decimal(42), sizeUk: null, sizeUs: null, unitPrice: new Prisma.Decimal(8500), quantity: 1, lineSubtotal: new Prisma.Decimal(8500), createdAt: new Date('2026-08-01T10:00:00Z') }],
};

function setup(order: Record<string, unknown> | null = confirmedOrder) {
  const findFirst = vi.fn().mockResolvedValue(order);
  const config = { get: vi.fn().mockReturnValue(undefined) };
  return { service: new InvoiceService({ order: { findFirst } } as never, config as never), findFirst };
}

describe('InvoiceService', () => {
  it('generates a non-empty PDF exclusively from the confirmed order snapshot', async () => {
    const { service, findFirst } = setup();
    const result = await service.generateOrderInvoice('RAQI-000123', 'customer-1');
    expect(result.filename).toBe('RAQI-Invoice-RAQI-000123.pdf');
    expect(result.buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(result.buffer.length).toBeGreaterThan(1000);
    expect(result.buffer.toString('latin1')).toContain('/Subtype /Image');
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { orderNumber: 'RAQI-000123', userId: 'customer-1' }, include: { items: { orderBy: { createdAt: 'asc' } } } }));
  });

  it('rejects an order that has never been confirmed', async () => {
    const { service } = setup({ ...confirmedOrder, status: 'PENDING', confirmedAt: null });
    await expect(service.generateOrderInvoice('RAQI-000123')).rejects.toBeInstanceOf(ConflictException);
  });

  it('does not disclose an order that is outside the customer ownership query', async () => {
    const { service } = setup(null);
    await expect(service.generateOrderInvoice('RAQI-000123', 'other-customer')).rejects.toBeInstanceOf(NotFoundException);
  });
});
