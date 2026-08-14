import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AccountService } from './account.service';

describe('AccountService address ownership', () => {
  it('does not delete an address owned by another customer', async () => {
    const prisma = { customerAddress: { findFirst: vi.fn().mockResolvedValue(null), delete: vi.fn() } };
    const service = new AccountService(prisma as never);
    await expect(service.deleteAddress('customer-a', 'address-b')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.customerAddress.delete).not.toHaveBeenCalled();
    expect(prisma.customerAddress.findFirst).toHaveBeenCalledWith({ where: { id: 'address-b', userId: 'customer-a' } });
  });
});
