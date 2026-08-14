import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateAddressInput, CustomerAccount, CustomerAddress, UpdateAddressInput, UpdateProfileInput } from '@footwear/shared';
import { PrismaService } from '../infrastructure/prisma/prisma.service';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string): Promise<CustomerAccount> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!user) throw new NotFoundException('Account not found');
    return { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified, profile: { firstName: user.profile?.firstName ?? null, lastName: user.profile?.lastName ?? null, phone: user.profile?.phone ?? null } };
  }

  async update(userId: string, input: UpdateProfileInput): Promise<CustomerAccount> {
    await this.prisma.customerProfile.upsert({ where: { userId }, create: { userId, ...input }, update: input });
    return this.get(userId);
  }

  async addresses(userId: string): Promise<CustomerAddress[]> { return (await this.prisma.customerAddress.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] })).map((address) => this.mapAddress(address)); }
  async createAddress(userId: string, input: CreateAddressInput): Promise<CustomerAddress> {
    const address = await this.prisma.$transaction(async (tx) => { if (input.isDefault) await tx.customerAddress.updateMany({ where: { userId }, data: { isDefault: false } }); return tx.customerAddress.create({ data: { userId, ...input } }); });
    return this.mapAddress(address);
  }
  async updateAddress(userId: string, id: string, input: UpdateAddressInput): Promise<CustomerAddress> {
    await this.requireAddress(userId, id);
    const address = await this.prisma.$transaction(async (tx) => { if (input.isDefault) await tx.customerAddress.updateMany({ where: { userId, id: { not: id } }, data: { isDefault: false } }); return tx.customerAddress.update({ where: { id }, data: input }); });
    return this.mapAddress(address);
  }
  async deleteAddress(userId: string, id: string): Promise<void> { await this.requireAddress(userId, id); await this.prisma.customerAddress.delete({ where: { id } }); }
  private async requireAddress(userId: string, id: string): Promise<void> { if (!await this.prisma.customerAddress.findFirst({ where: { id, userId } })) throw new NotFoundException('Address not found'); }
  private mapAddress(address: { id: string; recipientName: string; phone: string; addressLine: string; area: string | null; cityDistrict: string; postalCode: string | null; country: string; isDefault: boolean; createdAt: Date; updatedAt: Date }): CustomerAddress { return { ...address, createdAt: address.createdAt.toISOString(), updatedAt: address.updatedAt.toISOString() }; }
}
